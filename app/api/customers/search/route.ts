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

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([]);
        }

        const customers = await prisma.customer.findMany({
            where: {
                vendorId: user.sub,
                OR: [
                    { name: { contains: query } },
                    { phoneNumber: { contains: query } },
                ],
            },
            take: 5,
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Search customers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
