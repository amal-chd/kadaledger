import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const customer = await prisma.customer.findUnique({
            where: {
                id: id,
                vendorId: user.sub, // Ensure ownership
            },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 50,
                },
            },
        });

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Fetch customer details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
