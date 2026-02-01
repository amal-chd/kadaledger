import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;

        // 1. Total Outstanding (Sum of all customer balances)
        const customers = await prisma.customer.findMany({
            where: { vendorId },
            select: { balance: true },
        });

        const totalOutstanding = customers.reduce((sum: number, c: { balance: number }) => sum + (c.balance || 0), 0);

        // 2. Today's Activity (Transactions created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysTransactions = await prisma.transaction.findMany({
            where: {
                vendorId,
                date: { gte: today },
            },
            select: { type: true, amount: true },
        });

        const credits = todaysTransactions
            .filter((t: { type: string, amount: number }) => t.type === 'CREDIT')
            .reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);

        const payments = todaysTransactions
            .filter((t: { type: string, amount: number }) => t.type === 'PAYMENT')
            .reduce((sum: number, t: { amount: number }) => sum + (t.amount || 0), 0);

        // 3. High Risk Customers (Mock logic: balance > 5000)
        // 3. High Risk Customers
        // Condition: Balance >= 1000 AND No Payment in last 2 weeks (14 days)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

        const highRiskCustomers = await prisma.customer.findMany({
            where: {
                vendorId,
                balance: { gte: 1000 },
                transactions: {
                    none: {
                        type: 'PAYMENT',
                        date: { gte: twoWeeksAgo }
                    }
                }
            },
            take: 5,
            orderBy: { balance: 'desc' },
            select: { id: true, name: true, balance: true }
        });

        // 0. Total Customers
        const totalCustomers = await prisma.customer.count({
            where: { vendorId },
        });

        // 4. Total Collected (Sum of all PAYMENT transactions)
        const totalCollectedAgg = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                vendorId,
                type: 'PAYMENT'
            }
        });
        const totalCollected = totalCollectedAgg._sum.amount || 0;

        // --- READ-REPAIR: Sync Truth (SQL) to Cache (Firestore) ---
        // Fire and forget (don't await to block response)
        (async () => {
            try {
                const { firebaseAdmin } = await import('@/lib/firebase-admin');
                const adminDb = firebaseAdmin.firestore();
                const vendorRef = adminDb.collection('vendors').doc(vendorId);

                await vendorRef.set({
                    totalCustomers, // Root level sync as heavily used
                    stats: {
                        totalCredit: totalOutstanding,
                        // Note: 'todayCredit' and 'todayPayment' are transient real-time counters.
                        // Ideally we should sync them too if we have the data.
                        // For now, syncing the global totals helps the most integration issues.
                        todayCredit: credits, // Re-aligning today's stats too
                        todayPayment: payments,
                        totalCollected: totalCollected
                    },
                    lastSyncedAt: new Date().toISOString()
                }, { merge: true });
                console.log(`[Read-Repair] Synced stats for vendor ${vendorId}`);
            } catch (syncError) {
                console.error('[Read-Repair] Failed to sync Firestore:', syncError);
            }
        })();

        return NextResponse.json({
            totalCustomers,
            totalOutstanding,
            totalCollected,
            todaysActivity: {
                credits,
                payments,
                reminders: 0, // Placeholder
            },
            defaulterSummary: {
                count: highRiskCustomers.length,
                amount: highRiskCustomers.reduce((sum: number, c: { balance: number }) => sum + c.balance, 0),
                oldestDays: 0, // Placeholder
            },
            highRiskCustomers: highRiskCustomers.map((c: { id: string, name: string | null, balance: number }) => ({
                ...c,
                daysOverdue: 30, // Placeholder
                riskLevel: 'HIGH'
            })),
            whatsappUsage: {
                used: 0,
                limit: 100,
            },
            plan: {
                name: 'Free Trial',
                daysLeft: 14,
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
