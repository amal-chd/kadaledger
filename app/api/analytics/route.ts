import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const vendorId = decoded.sub;

        // 1. Total Customers
        const totalCustomers = await prisma.customer.count({
            where: { vendorId },
        });

        // 2. Total Outstanding Balance
        // Aggregate the balance field from customers
        const openBalance = await prisma.customer.aggregate({
            where: { vendorId },
            _sum: {
                balance: true,
            },
        });

        // 3. Today's Collections (Payments/Debit)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysCollections = await prisma.transaction.aggregate({
            where: {
                vendorId,
                type: { in: ['DEBIT', 'PAYMENT'] },
                date: { gte: today },
            },
            _sum: {
                amount: true,
            },
        });

        // 4. Today's Credit Given
        const todaysCredit = await prisma.transaction.aggregate({
            where: {
                vendorId,
                type: 'CREDIT',
                date: { gte: today },
            },
            _sum: {
                amount: true,
            },
        });

        // 5. Recent Transactions
        const recentTransactions = await prisma.transaction.findMany({
            where: { vendorId },
            orderBy: { date: 'desc' },
            take: 5,
            include: {
                customer: {
                    select: { name: true, phoneNumber: true }
                }
            }
        });

        // 6. Chart Data - Last 7 Days Revenue
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const dayRevenue = await prisma.transaction.aggregate({
                where: {
                    vendorId,
                    type: { in: ['DEBIT', 'PAYMENT'] },
                    date: {
                        gte: date,
                        lt: nextDate
                    }
                },
                _sum: {
                    amount: true
                }
            });

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            chartData.push({
                name: dayNames[date.getDay()],
                revenue: dayRevenue._sum.amount || 0
            });
        }

        return NextResponse.json({
            totalCustomers,
            totalOutstanding: openBalance._sum.balance || 0,
            todaysCollection: todaysCollections._sum.amount || 0,
            todaysCredit: todaysCredit._sum.amount || 0,
            recentTransactions,
            chartData
        });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
