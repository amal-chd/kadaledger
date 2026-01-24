import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

// Get all plans (including inactive) for Admin
export async function GET(req: Request) {
    try {
        console.log("API: Fetching plans...");
        // TODO: Add robust Admin middleware check
        // For now, we assume this route is protected by frontend layout or middleware

        const plans = await prisma.pricingPlan.findMany({
            orderBy: { price: 'asc' }
        });
        console.log("API: Plans fetched:", plans);
        return NextResponse.json(plans);
    } catch (error: any) {
        console.error("API: Error fetching plans:", error);
        return NextResponse.json({ error: 'Failed to fetch plans', details: error.message }, { status: 500 });
    }
}

// Update a plan
export async function PATCH(req: Request) {
    try {
        // TODO: Verify Admin Role

        const body = await req.json();
        const { id, price, isActive, name } = body;

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
        }

        const updatedPlan = await prisma.pricingPlan.update({
            where: { id },
            data: {
                price: price !== undefined ? parseFloat(price) : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                name: name !== undefined ? name : undefined,
            }
        });

        return NextResponse.json(updatedPlan);
    } catch (error) {
        console.error("Update Plan Error:", error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
