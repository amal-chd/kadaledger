import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';
import { SyncService } from '@/lib/sync-service';

export const dynamic = 'force-dynamic';

// GET: Fetch all customers for the logged-in vendor
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const customers = await prisma.customer.findMany({
            where: { vendorId: user.sub },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Fetch customers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new customer
export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, phoneNumber } = await req.json();

        // Validation: At least one of name or phoneNumber is required (relaxed validation)
        if (!name && !phoneNumber) {
            return NextResponse.json({ error: 'Either Name or Phone Number is required' }, { status: 400 });
        }

        // Check availability
        if (phoneNumber) {
            const existing = await prisma.customer.findFirst({
                where: {
                    vendorId: user.sub,
                    phoneNumber: phoneNumber
                }
            });
            if (existing) {
                return NextResponse.json({ error: 'Customer with this phone number already exists' }, { status: 400 });
            }
        }

        const newCustomer = await prisma.customer.create({
            data: {
                name,
                phoneNumber,
                vendorId: user.sub,
            },
        });

        // Sync Real-Time Count
        await SyncService.syncCustomerCount(user.sub, true);

        return NextResponse.json(newCustomer);
    } catch (error) {
        console.error('Add customer error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
