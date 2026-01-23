import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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


        const { id: vendorId } = await params;

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                subscription: true,
                customers: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                },
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 10
                }
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Calculate stats
        const customerCount = await prisma.customer.count({ where: { vendorId } });
        const transactionCount = await prisma.transaction.count({ where: { vendorId } });

        // Calculate financial stats
        const allCustomers = await prisma.customer.findMany({
            where: { vendorId },
            select: { balance: true }
        });
        const totalPending = allCustomers.reduce((sum, c) => sum + Number(c.balance || 0), 0);

        return NextResponse.json({
            ...vendor,
            stats: {
                customerCount,
                transactionCount,
                totalPending
            }
        });

    } catch (error) {
        console.error('Fetch vendor details error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update Vendor (Subscription, Status, etc.)
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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


        const { id: vendorId } = await params;
        const body = await req.json();
        const { planType, status, businessName, phoneNumber, language } = body;

        // Update Vendor Profile
        if (businessName || phoneNumber || language) {
            await prisma.vendor.update({
                where: { id: vendorId },
                data: {
                    businessName,
                    phoneNumber,
                    language
                }
            });
        }

        // Perform update
        // Note: For subscription, we might need to update the related Subscription model or the Vendor if fields are there.
        // Assuming subscription is a relation, we need to update that.

        // First get current subscription
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: { subscription: true }
        });

        if (vendor?.subscription) {
            await prisma.subscription.update({
                where: { id: vendor.subscription.id },
                data: {
                    planType: planType || vendor.subscription.planType,
                    status: status || vendor.subscription.status
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update vendor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Remove/Suspend Vendor
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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


        const { id: vendorId } = await params;

        // Manually cascade delete related records
        // 1. Delete Transactions
        await prisma.transaction.deleteMany({
            where: { vendorId }
        });

        // 2. Delete Customers
        await prisma.customer.deleteMany({
            where: { vendorId }
        });

        // 3. Delete Subscription
        await prisma.subscription.deleteMany({
            where: { vendorId }
        });

        // 4. Finally Delete Vendor
        await prisma.vendor.delete({
            where: { id: vendorId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete vendor error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
