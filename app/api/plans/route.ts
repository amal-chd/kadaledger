import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const plans = await prisma.pricingPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error('API PLANS ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch plans', details: String(error) }, { status: 500 });
    }
}
