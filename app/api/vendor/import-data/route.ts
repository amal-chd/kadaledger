import { NextResponse } from 'next/server';
import { getJwtPayload } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const body = await req.json();
        const { customers, transactions } = body;

        if (!customers || !Array.isArray(customers)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();
        const batch = db.batch();

        // Import customers
        let customerCount = 0;
        for (const customer of customers) {
            const customerRef = db.collection('vendors').doc(vendorId).collection('customers').doc();
            batch.set(customerRef, {
                ...customer,
                id: customerRef.id,
                vendorId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            customerCount++;
        }

        // Import transactions if provided
        let transactionCount = 0;
        if (transactions && Array.isArray(transactions)) {
            for (const transaction of transactions) {
                const txRef = db.collection('vendors').doc(vendorId).collection('transactions').doc();
                batch.set(txRef, {
                    ...transaction,
                    id: txRef.id,
                    vendorId,
                    createdAt: new Date()
                });
                transactionCount++;
            }
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            imported: {
                customers: customerCount,
                transactions: transactionCount
            }
        });
    } catch (error) {
        console.error('Import data error:', error);
        return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
    }
}
