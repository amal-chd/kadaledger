import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const customer = await prisma.customer.findUnique({
            where: {
                id: id,
                vendorId: user.sub, // Ensure security
            },
            include: {
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 20
                }
            }
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

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, phoneNumber } = body;

        const updatedCustomer = await prisma.customer.update({
            where: {
                id: id,
                vendorId: user.sub
            },
            data: {
                name,
                phoneNumber
            }
        });

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete associated transactions first (optional, depending on cascade settings, but safer)
        await prisma.transaction.deleteMany({
            where: { customerId: id }
        });

        await prisma.customer.delete({
            where: {
                id: id,
                vendorId: user.sub
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('Delete customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
