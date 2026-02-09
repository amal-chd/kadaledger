import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import jwt from 'jsonwebtoken';
import { normalizePlanType, getPlanDurationDays } from '@/lib/admin-plans';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload: any = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }


        const { id: vendorId } = await params;
        const db = firebaseAdmin.firestore();

        const vendorDoc = await db.collection('vendors').doc(vendorId).get();

        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const vendor = vendorDoc.data();
        const normalizedPlanType = normalizePlanType(vendor?.subscription?.planType || vendor?.plan || 'FREE');
        const normalizedStatus = String(vendor?.subscription?.status || vendor?.planStatus || 'ACTIVE').toUpperCase() === 'SUSPENDED'
            ? 'SUSPENDED'
            : 'ACTIVE';

        // Fetch recent customers (top 5)
        const customersSnapshot = await db.collection('vendors')
            .doc(vendorId)
            .collection('customers')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        const customers = customersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch recent transactions (top 10)
        const transactionsSnapshot = await db.collection('vendors')
            .doc(vendorId)
            .collection('transactions')
            .orderBy('date', 'desc')
            .limit(10)
            .get();
        const transactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Calculate stats
        const allCustomersSnapshot = await db.collection('vendors').doc(vendorId).collection('customers').get();
        const allTransactionsSnapshot = await db.collection('vendors').doc(vendorId).collection('transactions').get();

        const customerCount = allCustomersSnapshot.size;
        const transactionCount = allTransactionsSnapshot.size;

        // Calculate financial stats
        let totalPending = 0;
        allCustomersSnapshot.docs.forEach(doc => {
            const customer = doc.data();
            totalPending += Number(customer.balance || 0);
        });

        return NextResponse.json(serializeFirestoreData({
            ...vendor,
            id: vendor?.id || vendorId,
            plan: normalizedPlanType,
            subscription: {
                ...(vendor?.subscription || {}),
                planType: normalizedPlanType,
                status: normalizedStatus,
            },
            customers,
            transactions,
            stats: {
                customerCount,
                transactionCount,
                totalPending
            }
        }));

    } catch (error) {
        console.error('Fetch vendor details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update Vendor (Subscription, Status, etc.)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload: any = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }


        const { id: vendorId } = await params;
        const body = await req.json();
        const { planType, status, businessName, phoneNumber, language } = body;

        const db = firebaseAdmin.firestore();
        const vendorRef = db.collection('vendors').doc(vendorId);
        const vendorDoc = await vendorRef.get();

        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const updateData: any = {};

        // Update Vendor Profile
        if (businessName) updateData.businessName = businessName;
        if (phoneNumber) {
            updateData.phoneNumber = phoneNumber;
            updateData.phoneSearchKey = normalizePhone(phoneNumber);
        }
        if (language) updateData.language = language;

        // Update subscription fields (assuming subscription is embedded in vendor doc)
        if (planType || status) {
            const vendor = vendorDoc.data();
            const subscription = vendor?.subscription || {};
            const normalizedPlanType = planType ? normalizePlanType(planType) : undefined;
            const normalizedStatus = status ? String(status).toUpperCase() : undefined;
            const validStatus = normalizedStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';

            updateData.subscription = {
                ...subscription,
                ...(normalizedPlanType && { planType: normalizedPlanType }),
                ...(normalizedStatus && { status: validStatus })
            };

            if (normalizedPlanType) {
                const now = new Date();
                const days = getPlanDurationDays(normalizedPlanType);
                updateData.plan = normalizedPlanType;
                updateData.trialStartDate = now;
                updateData.subscriptionEndDate = days === null
                    ? new Date('2099-12-31T23:59:59.999Z')
                    : new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
                updateData.planStatus = 'ACTIVE';
            }
        }

        if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date();
            await vendorRef.update(updateData);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update vendor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

function normalizePhone(input: string) {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.length > 10 ? digits.slice(-10) : digits;
}

// DELETE: Remove/Suspend Vendor
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload: any = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }


        const { id: vendorId } = await params;
        const db = firebaseAdmin.firestore();

        // Delete subcollections (customers and transactions)
        const customersSnapshot = await db.collection('vendors').doc(vendorId).collection('customers').get();
        const customerDeletePromises = customersSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(customerDeletePromises);

        const transactionsSnapshot = await db.collection('vendors').doc(vendorId).collection('transactions').get();
        const transactionDeletePromises = transactionsSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(transactionDeletePromises);

        // Finally delete vendor document
        await db.collection('vendors').doc(vendorId).delete();

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete vendor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
