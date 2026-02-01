import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
    try {
        // Basic Auth Check
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

        // Fetch Stats
        const totalVendors = await prisma.vendor.count();
        const totalCustomers = await prisma.customer.count();

        // Calculate total pending (sum of all customer balances)
        const customersWithBalance = await prisma.customer.findMany({
            select: { balance: true }
        });
        const totalPending = customersWithBalance.reduce((sum, c) => sum + Number(c.balance || 0), 0);

        // Recent Vendors
        const recentVendors = await prisma.vendor.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                businessName: true,
                phoneNumber: true,
                createdAt: true,
                subscription: true,
            }
        });

        // Transactions stats for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaysTransactions = await prisma.transaction.aggregate({
            where: {
                date: { gte: startOfDay }
            },
            _count: true,
            _sum: {
                amount: true
            }
        });

        return NextResponse.json({
            overview: {
                totalVendors,
                totalCustomers,
                totalPending,
                todaysVolume: todaysTransactions._sum.amount || 0,
                todaysCount: todaysTransactions._count
            },
            recentVendors,
            systemHealth: 'Healthy'
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
