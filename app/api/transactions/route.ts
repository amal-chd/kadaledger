import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


// GET: Fetch recent transactions
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        const whereClause: any = { vendorId: user.sub };
        if (customerId) {
            whereClause.customerId = customerId;
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: { customer: { select: { name: true, phoneNumber: true } } },
            orderBy: { date: 'desc' },
            take: 50, // Limit to last 50 for now
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Fetch transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new transaction (Credit or Payment)
export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customerId, type, amount, description, date } = await req.json();

        if (!customerId || !type || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Transaction
        const transaction = await prisma.transaction.create({
            data: {
                vendorId: user.sub,
                customerId,
                type, // 'CREDIT' or 'PAYMENT'
                amount: parseFloat(amount),
                description,
                date: date ? new Date(date) : new Date(),
            },
        });

        // 2. Update Customer Balance
        // If CREDIT, balance increases (customer owes more)
        // If PAYMENT, balance decreases (customer owes less)
        const balanceChange = type === 'CREDIT' ? parseFloat(amount) : -parseFloat(amount);

        await prisma.customer.update({
            where: { id: customerId },
            data: {
                balance: { increment: balanceChange },
            },
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Add transaction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
