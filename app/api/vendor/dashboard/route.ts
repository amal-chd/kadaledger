import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import { getClientTimeContext, getLocalDateKey, getUtcRangeForLocalDates } from '@/lib/time-context';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const db = firebaseAdmin.firestore();
        const timeContext = getClientTimeContext(req);

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

        // Calculate balances and identify high-risk customers
        let totalOutstanding = 0;
        const highRiskCustomers: any[] = [];

        customersSnapshot.docs.forEach(doc => {
            const customer = doc.data();
            const balance = Number(customer.balance || 0);
            totalOutstanding += balance;

            // High risk: balance > creditLimit, or balance >= 5000 with no creditLimit
            const creditLimit = Number(customer.creditLimit || 0);
            const isOverLimit = creditLimit > 0 && balance > creditLimit;
            const isHighBalance = balance >= 5000;

            if (balance > 0 && (isOverLimit || isHighBalance)) {
                highRiskCustomers.push({
                    id: customer.id || doc.id,
                    name: customer.name || 'Unknown',
                    phoneNumber: customer.phoneNumber || null,
                    balance,
                    creditLimit: creditLimit || null,
                });
            }
        });

        // Sort high risk by balance descending, limit to top 10
        highRiskCustomers.sort((a, b) => b.balance - a.balance);
        const topHighRisk = highRiskCustomers.slice(0, 10);

        // Calculate today's activity
        const todayKey = getLocalDateKey(new Date(), timeContext);
        const { start: startOfDay, end: endOfDay } = getUtcRangeForLocalDates(todayKey, todayKey, timeContext);

        let todaysCredits = 0;
        let todaysPayments = 0;
        let todaysCount = 0;

        // Calculate totals
        let totalCredit = 0;
        let totalPayment = 0;

        transactionsSnapshot.docs.forEach(doc => {
            const tx = doc.data();
            const amount = Number(tx.amount || 0);

            if (tx.type === 'CREDIT') {
                totalCredit += amount;
            } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                totalPayment += amount;
            }

            // Check if transaction is from today
            const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
            if (txDate >= startOfDay && txDate <= endOfDay) {
                todaysCount++;
                if (tx.type === 'CREDIT') {
                    todaysCredits += amount;
                } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                    todaysPayments += amount;
                }
            }
        });

        const dashboardData = {
            totalCustomers,
            totalTransactions,
            totalCredit,
            totalPayment,
            totalOutstanding,
            todaysActivity: {
                credits: todaysCredits,
                payments: todaysPayments,
                count: todaysCount,
            },
            highRiskCustomers: topHighRisk,
        };

        return NextResponse.json(serializeFirestoreData(dashboardData));

    } catch (error) {
        console.error('Dashboard fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
