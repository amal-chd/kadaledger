import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
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

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const db = firebaseAdmin.firestore();

        // Collect all transactions from all vendors
        const vendorsSnapshot = await db.collection('vendors').get();
        const allTransactions: any[] = [];

        for (const vendorDoc of vendorsSnapshot.docs) {
            const vendor = vendorDoc.data();
            const transactionsSnapshot = await db.collection('vendors')
                .doc(vendorDoc.id)
                .collection('transactions')
                .get();

            for (const txDoc of transactionsSnapshot.docs) {
                const tx = txDoc.data();

                // Fetch customer details
                let customer = null;
                if (tx.customerId) {
                    const customerDoc = await db.collection('vendors')
                        .doc(vendorDoc.id)
                        .collection('customers')
                        .doc(tx.customerId)
                        .get();
                    if (customerDoc.exists) {
                        const custData = customerDoc.data();
                        customer = { name: custData?.name, phoneNumber: custData?.phoneNumber };
                    }
                }

                allTransactions.push({
                    id: tx.id || txDoc.id,
                    ...tx,
                    vendor: { businessName: vendor.businessName, phoneNumber: vendor.phoneNumber },
                    customer
                });
            }
        }

        // Sort by date descending
        allTransactions.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });

        // Pagination
        const total = allTransactions.length;
        const skip = (page - 1) * limit;
        const transactions = allTransactions.slice(skip, skip + limit);

        return NextResponse.json(serializeFirestoreData({
            data: transactions,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        }));

    } catch (error) {
        console.error('Fetch transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
