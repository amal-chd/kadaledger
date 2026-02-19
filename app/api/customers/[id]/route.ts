import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const customerDoc = await db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .doc(id)
            .get();

        if (!customerDoc.exists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        const customer = customerDoc.data();

        // Fetch recent transactions
        const transactionsSnapshot = await db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .doc(id)
            .collection('transactions')
            .orderBy('date', 'desc')
            .limit(20)
            .get();

        const transactions = transactionsSnapshot.docs.map(doc => doc.data());

        return NextResponse.json(serializeFirestoreData({
            ...customer,
            transactions
        }));
    } catch (error) {
        console.error('Fetch customer details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
        const rawPhoneNumber = typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : undefined;
        const phoneNumber = rawPhoneNumber !== undefined ? normalizePhone(rawPhoneNumber) : undefined;
        const creditLimit = body?.creditLimit;

        const db = firebaseAdmin.firestore();
        const customerRef = db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .doc(id);

        const updateData: any = {
            updatedAt: new Date()
        };

        if (name !== undefined) updateData.name = name || null;
        if (phoneNumber !== undefined) {
            if (phoneNumber) {
                const duplicateSnapshot = await db
                    .collection('vendors')
                    .doc(user.sub)
                    .collection('customers')
                    .where('phoneSearchKey', '==', phoneNumber)
                    .limit(2)
                    .get();

                const duplicateFound = duplicateSnapshot.docs.some((doc) => doc.id !== id);
                if (duplicateFound) {
                    return NextResponse.json({ error: 'Customer with this phone number already exists' }, { status: 400 });
                }
            }

            updateData.phoneNumber = phoneNumber || null;
            updateData.phoneSearchKey = phoneNumber || null;
        }
        if (creditLimit !== undefined) updateData.creditLimit = creditLimit;

        await customerRef.update(updateData);

        const updatedDoc = await customerRef.get();
        return NextResponse.json(updatedDoc.data());
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();

        // Delete all transactions for this customer
        const transactionsSnapshot = await db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .doc(id)
            .collection('transactions')
            .get();

        const batch = db.batch();
        transactionsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Delete customer document
        batch.delete(db.collection('vendors').doc(user.sub).collection('customers').doc(id));

        await batch.commit();

        // Decrement vendor's customer count
        await db.collection('vendors').doc(user.sub).update({
            totalCustomers: firebaseAdmin.firestore.FieldValue.increment(-1)
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Delete customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function normalizePhone(input: string) {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.length > 10 ? digits.slice(-10) : digits;
}
