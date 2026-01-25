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
        const highRiskCustomers = await prisma.customer.findMany({
            where: {
                vendorId,
                balance: { gt: 5000 }
            },
            take: 5,
            orderBy: { balance: 'desc' },
            select: { id: true, name: true, balance: true }
        });

        return NextResponse.json({
            totalOutstanding,
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
