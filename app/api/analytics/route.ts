import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;

        // 1. Overview Metrics (Aggregated)
        // We can run these concurrently
        const [
            totalCustomers,
            outstandingAgg,
            todaysStats,
            recentTransactions,
            topDefaulters
        ] = await Promise.all([
            prisma.customer.count({ where: { vendorId } }),
            prisma.customer.aggregate({
                where: { vendorId },
                _sum: { balance: true }
            }),
            // Today's stats
            (async () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const txs = await prisma.transaction.groupBy({
                    by: ['type'],
                    where: {
                        vendorId,
                        date: { gte: today }
                    },
                    _sum: { amount: true }
                });

                let credit = 0;
                let payment = 0;
                txs.forEach(t => {
                    if (t.type === 'CREDIT') credit = (t._sum.amount || 0);
                    if (t.type === 'PAYMENT' || t.type === 'DEBIT') payment = (t._sum.amount || 0);
                });
                return { credit, payment };
            })(),
            // Recent Transactions
            prisma.transaction.findMany({
                where: { vendorId },
                orderBy: { date: 'desc' },
                take: 5,
                include: { customer: { select: { name: true, phoneNumber: true } } }
            }),
            // Top Defaulters (High Risk)
            prisma.customer.findMany({
                where: { vendorId, balance: { gt: 0 } },
                orderBy: { balance: 'desc' },
                take: 5,
                select: { id: true, name: true, balance: true, phoneNumber: true }
            })
        ]);

        // 2. Chart Data - Last 30 Days
        // Fetch raw transactions and aggregate in memory (faster than 30 separate queries)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const periodTransactions = await prisma.transaction.findMany({
            where: {
                vendorId,
                date: { gte: thirtyDaysAgo }
            },
            select: {
                date: true,
                type: true,
                amount: true
            }
        });

        // Group by Date
        const dailyStats = new Map<string, { credit: number, payment: number }>();

        // Initialize last 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyStats.set(key, { credit: 0, payment: 0 });
        }

        periodTransactions.forEach(tx => {
            const dateKey = new Date(tx.date).toISOString().split('T')[0];
            if (dailyStats.has(dateKey)) {
                const entry = dailyStats.get(dateKey)!;
                if (tx.type === 'CREDIT') {
                    entry.credit += tx.amount;
                } else if (tx.type === 'PAYMENT' || tx.type === 'DEBIT') {
                    entry.payment += tx.amount;
                }
            }
        });

        // Convert map to sorted array
        // Map keys are not guaranteed sorted, but we initialized them in reverse order? 
        // Better to sort by date string explicitly.
        const chartData = Array.from(dailyStats.entries())
            .map(([date, stats]) => ({
                date,
                name: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                credit: stats.credit,
                payment: stats.payment
            }))
            .sort((a, b) => a.date.localeCompare(b.date)); // Sort ascending for chart

        return NextResponse.json({
            totalCustomers,
            totalOutstanding: outstandingAgg._sum.balance || 0,
            todaysCollection: todaysStats.payment,
            todaysCredit: todaysStats.credit,
            recentTransactions,
            topDefaulters,
            chartData
        });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
