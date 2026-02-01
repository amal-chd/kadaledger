import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';
import { SyncService } from '@/lib/sync-service';

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

        const body = await req.json();
        console.log('Transaction Request Body:', body);
        const { customerId, type, amount, description, date } = body;

        if (!customerId || !type || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Transaction
        const transactionDate = date ? new Date(date) : new Date();
        if (isNaN(transactionDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        const transactionAmount = Number(amount);
        if (isNaN(transactionAmount)) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                vendorId: user.sub,
                customerId,
                type, // 'CREDIT' or 'PAYMENT'
                amount: transactionAmount,
                description: description || undefined,
                date: transactionDate,
            },
        });

        // 2. Update Customer Balance
        // If CREDIT, balance increases (customer owes more)
        // If PAYMENT, balance decreases (customer owes less)
        const balanceChange = type === 'CREDIT' ? transactionAmount : -transactionAmount;

        const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
                balance: { increment: balanceChange },
            },
        });

        // [SYNC] Double-Write to Firestore
        await SyncService.syncTransaction(user.sub, customerId, transaction, updatedCustomer.balance);

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Add transaction error details:', error);
        // @ts-ignore
        if (error.code) console.error('Error code:', error.code);
        // @ts-ignore
        if (error.meta) console.error('Error meta:', error.meta);

        return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
    }
}
