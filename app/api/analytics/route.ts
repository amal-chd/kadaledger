import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import { getClientTimeContext, getLocalDateKey } from '@/lib/time-context';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const db = firebaseAdmin.firestore();
        const timeContext = getClientTimeContext(req);

        // Fetch all customers
        const customersSnapshot = await db.collection('vendors').doc(vendorId).collection('customers').get();
        const totalCustomers = customersSnapshot.size;

        // Calculate total outstanding
        let totalOutstanding = 0;
        customersSnapshot.docs.forEach(doc => {
            const customer = doc.data();
            totalOutstanding += Number(customer.balance || 0);
        });

        // Fetch all transactions
        // Calculate date range for chart (last 30 days) + buffer for timezone differences
        const today = new Date();
        const thirtyTwoDaysAgo = new Date(today);
        thirtyTwoDaysAgo.setDate(today.getDate() - 32);

        // Fetch ONLY recent transactions for chart & today's stats
        const transactionsSnapshot = await db.collection('vendors')
            .doc(vendorId)
            .collection('transactions')
            .where('date', '>=', thirtyTwoDaysAgo)
            .get();

        // Today's stats in device local timezone
        const todayKey = getLocalDateKey(new Date(), timeContext);

        let todaysCredit = 0;
        let todaysPayment = 0;

        transactionsSnapshot.docs.forEach(doc => {
            const tx = doc.data();
            const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
            const txDateKey = getLocalDateKey(txDate, timeContext);

            if (txDateKey === todayKey) {
                if (tx.type === 'CREDIT') {
                    todaysCredit += Number(tx.amount || 0);
                } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                    todaysPayment += Number(tx.amount || 0);
                }
            }
        });

        // Recent Transactions (top 5)
        const recentTransactionsSnapshot = await db.collection('vendors')
            .doc(vendorId)
            .collection('transactions')
            .orderBy('date', 'desc')
            .limit(5)
            .get();

        const recentTransactions = await Promise.all(recentTransactionsSnapshot.docs.map(async doc => {
            const tx = doc.data();
            let customer = null;
            if (tx.customerId) {
                const customerDoc = await db.collection('vendors')
                    .doc(vendorId)
                    .collection('customers')
                    .doc(tx.customerId)
                    .get();
                if (customerDoc.exists) {
                    const custData = customerDoc.data();
                    customer = { name: custData?.name, phoneNumber: custData?.phoneNumber };
                }
            }
            return { ...tx, customer };
        }));

        // Top Defaulters (High balance customers)
        const customers = customersSnapshot.docs
            .map(doc => doc.data())
            .filter(c => Number(c.balance || 0) > 0)
            .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0))
            .slice(0, 5)
            .map(c => ({
                id: c.id,
                name: c.name,
                balance: c.balance,
                phoneNumber: c.phoneNumber
            }));

        // Chart Data - Last 30 Days in device local timezone
        const dailyStats = new Map<string, { credit: number, payment: number }>();

        const [todayYear, todayMonth, todayDay] = todayKey.split('-').map(Number);
        for (let i = 29; i >= 0; i--) {
            const day = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay - i));
            const key = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
            dailyStats.set(key, { credit: 0, payment: 0 });
        }

        // Aggregate transactions
        transactionsSnapshot.docs.forEach(doc => {
            const tx = doc.data();
            const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
            const dateKey = getLocalDateKey(txDate, timeContext);
            if (dailyStats.has(dateKey)) {
                const entry = dailyStats.get(dateKey)!;
                if (tx.type === 'CREDIT') {
                    entry.credit += Number(tx.amount || 0);
                } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                    entry.payment += Number(tx.amount || 0);
                }
            }
        });

        const chartData = Array.from(dailyStats.entries())
            .map(([date, stats]) => ({
                date,
                name: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC'
                }),
                credit: stats.credit,
                payment: stats.payment
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        const analyticsData = {
            totalCustomers,
            totalOutstanding,
            todaysCollection: todaysPayment,
            todaysCredit,
            recentTransactions: recentTransactions,
            topDefaulters: customers,
            chartData
        };

        return NextResponse.json(serializeFirestoreData(analyticsData));
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
