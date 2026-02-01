import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
    try {
        // Auth Check
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

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const where: any = {};
        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [vendors, total] = await Promise.all([
            prisma.vendor.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    subscription: true,
                    _count: {
                        select: { customers: true, transactions: true }
                    }
                }
            }),
            prisma.vendor.count({ where })
        ]);

        // Enrich with total pending calculation
        const vendorsWithStats = await Promise.all(vendors.map(async (v) => {
            const customers = await prisma.customer.findMany({
                where: { vendorId: v.id },
                select: { balance: true }
            });
            const totalPending = customers.reduce((sum, c) => sum + Number(c.balance || 0), 0);

            return {
                id: v.id,
                businessName: v.businessName,
                phoneNumber: v.phoneNumber,
                createdAt: v.createdAt,
                subscription: v.subscription,
                customerCount: v._count.customers,
                transactionCount: v._count.transactions,
                totalPending
            };
        }));

        return NextResponse.json({
            data: vendorsWithStats,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Fetch vendors error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
