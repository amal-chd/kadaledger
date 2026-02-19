import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

// GET: Fetch all customers for the logged-in vendor
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const customersSnapshot = await db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .orderBy('updatedAt', 'desc')
            .get();

        const customers = customersSnapshot.docs.map(doc => doc.data());
        return NextResponse.json(serializeFirestoreData(customers));
    } catch (error) {
        console.error('Fetch customers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new customer
export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        const rawPhone = typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
        const phoneNumber = normalizePhone(rawPhone);
        const creditLimit = body?.creditLimit;

        // Validation
        if (!name && !phoneNumber) {
            return NextResponse.json({ error: 'Either Name or Phone Number is required' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();

        // Check for duplicates
        if (phoneNumber) {
            const bySearchKey = await db
                .collection('vendors')
                .doc(user.sub)
                .collection('customers')
                .where('phoneSearchKey', '==', phoneNumber)
                .limit(1)
                .get();

            if (!bySearchKey.empty) {
                return NextResponse.json({ error: 'Customer with this phone number already exists' }, { status: 400 });
            }
        }

        // Create new customer
        const customerRef = db.collection('vendors').doc(user.sub).collection('customers').doc();
        const now = new Date();
        const newCustomer = {
            id: customerRef.id,
            name: name || null,
            phoneNumber: phoneNumber || null,
            phoneSearchKey: phoneNumber || null,
            balance: 0,
            creditLimit: creditLimit ? parseFloat(creditLimit) : null,
            vendorId: user.sub,
            createdAt: now,
            updatedAt: now
        };

        // Use batch write for atomic operation and better performance
        const batch = db.batch();

        batch.set(customerRef, newCustomer);

        // Update vendor's customer count
        const vendorRef = db.collection('vendors').doc(user.sub);
        batch.update(vendorRef, {
            totalCustomers: firebaseAdmin.firestore.FieldValue.increment(1)
        });

        await batch.commit();

        return NextResponse.json(newCustomer);
    } catch (error) {
        console.error('Add customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function normalizePhone(input: string) {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.length > 10 ? digits.slice(-10) : digits;
}
