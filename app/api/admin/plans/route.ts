import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { SyncService } from '@/lib/sync-service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Helper to verify Admin
async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;

    try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (error) {
        return false;
    }
}

export async function GET(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const plans = await prisma.pricingPlan.findMany({
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, price, isActive, features, description } = body;

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
        }

        const updatedPlan = await prisma.pricingPlan.update({
            where: { id },
            data: {
                price: price !== undefined ? parseFloat(price) : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                features: features !== undefined ? features : undefined,
                description: description !== undefined ? description : undefined,
            }
        });

        // [SYNC] Create Snapshot of Active Plans for Clients
        const allActivePlans = await prisma.pricingPlan.findMany({
            where: { isActive: true },
            select: { name: true, price: true, interval: true, id: true, features: true }
        });
        await SyncService.syncPricingPlans(allActivePlans);

        return NextResponse.json(updatedPlan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
