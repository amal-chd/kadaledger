import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { getClientTimeContext, getUtcRangeForLocalDates } from '@/lib/time-context';

export async function POST(req: NextRequest) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { startDate, endDate, customerId } = body;

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
        }

        const vendorId = user.sub;
        const db = firebaseAdmin.firestore();
        const timeContext = getClientTimeContext(req);

        const { start, end } = getUtcRangeForLocalDates(startDate, endDate, timeContext);

        // Fetch all transactions from vendor's subcollection
        const transactionsSnapshot = await db
            .collection('vendors')
            .doc(vendorId)
            .collection('transactions')
            .where('date', '>=', start)
            .where('date', '<=', end)
            .orderBy('date', 'desc')
            .get();

        let transactions = transactionsSnapshot.docs.map(doc => doc.data());

        // Filter by customerId if provided
        if (customerId) {
            transactions = transactions.filter(tx => tx.customerId === customerId);
        }

        // Fetch customer details for each transaction
        const transactionsWithCustomer = await Promise.all(
            transactions.map(async tx => {
                if (tx.customerId) {
                    const customerDoc = await db
                        .collection('vendors')
                        .doc(vendorId)
                        .collection('customers')
                        .doc(tx.customerId)
                        .get();

                    if (customerDoc.exists) {
                        const customerData = customerDoc.data();
                        return {
                            ...tx,
                            customer: {
                                name: customerData?.name,
                                phoneNumber: customerData?.phoneNumber
                            }
                        };
                    }
                }
                return tx;
            })
        );

        // Calculate summary statistics
        let totalCredit = 0;
        let totalPayment = 0;

        transactions.forEach((tx) => {
            if (tx.type === 'CREDIT') {
                totalCredit += Number(tx.amount || 0);
            } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                totalPayment += Number(tx.amount || 0);
            }
        });

        return NextResponse.json({
            transactions: transactionsWithCustomer,
            summary: {
                totalCredit,
                totalPayment,
                netBalance: totalCredit - totalPayment,
                count: transactions.length,
            },
        });
    } catch (error) {
        console.error('Error fetching transaction report:', error);
        return NextResponse.json({ error: 'Failed to fetch report data' }, { status: 500 });
    }
}
