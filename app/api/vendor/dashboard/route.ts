import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const db = firebaseAdmin.firestore();

        // Parallelize all Firestore reads for better performance
        const [vendorDoc, customersSnapshot, transactionsSnapshot] = await Promise.all([
            db.collection('vendors').doc(vendorId).get(),
            db.collection('vendors').doc(vendorId).collection('customers').get(),
            db.collection('vendors').doc(vendorId).collection('transactions').get()
        ]);

        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const totalCustomers = customersSnapshot.size;
        const totalTransactions = transactionsSnapshot.size;

        // Calculate balances
        let totalCredit = 0;
        let totalPayment = 0;
        let totalPending = 0;

        customersSnapshot.docs.forEach(doc => {
            const customer = doc.data();
            totalPending += Number(customer.balance || 0);
        });

        transactionsSnapshot.docs.forEach(doc => {
            const tx = doc.data();
            if (tx.type === 'CREDIT') {
                totalCredit += Number(tx.amount || 0);
            } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                totalPayment += Number(tx.amount || 0);
            }
        });

        const dashboardData = {
            totalCustomers,
            totalTransactions,
            totalCredit,
            totalPayment,
            totalPending
        };

        return NextResponse.json(serializeFirestoreData(dashboardData));

    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
