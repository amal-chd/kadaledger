import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await req.json();
        const { startDate, endDate, customerId } = body;

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
        }

        const vendorId = decoded.sub;

        // Build query filters
        const where: any = {
            vendorId: vendorId,
            date: {
                gte: new Date(startDate),
                lte: new Date(endDate + 'T23:59:59.999Z'), // Include entire end date
            },
        };

        // Add customer filter if provided
        if (customerId) {
            where.customerId = customerId;
        }

        // Fetch transactions
        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                customer: {
                    select: {
                        name: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        // Calculate summary statistics
        let totalCredit = 0;
        let totalPayment = 0;

        transactions.forEach((tx) => {
            if (tx.type === 'CREDIT') {
                totalCredit += tx.amount;
            } else if (tx.type === 'PAYMENT') {
                totalPayment += tx.amount;
            }
        });

        return NextResponse.json({
            transactions,
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
