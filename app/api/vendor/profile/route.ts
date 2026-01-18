import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


// GET: Fetch Vendor Profile
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { id: user.sub },
            include: {
                subscription: true, // properties: planType, status, startDate, endDate
            },
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: vendor.id,
            // name: vendor.ownerName || '', // Removed: Field does not exist in schema
            businessName: vendor.businessName,
            phoneNumber: vendor.phoneNumber,
            // businessCategory: vendor.businessCategory || 'Retail', // Removed
            // city: vendor.city || '', // Removed
            language: vendor.language || 'English',
            subscription: vendor.subscription
        });

    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Update Vendor Profile
export async function PATCH(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        // Allow updating: businessName, ownerName, businessCategory, city, language
        // And subscription related updates if needed (usually handled by payment webhook, but okay for trial start)

        // Extract only allowed fields
        const { businessName, language, plan, trialStartDate } = body;

        const updateData: any = {
            businessName,
            language
        };

        // Special handling for Starting Trial (if sent from mobile onboarding)
        // In a real app, strict checks would be needed.
        if (plan === 'TRIAL' && trialStartDate) {
            // Check if subscription exists, otherwise create/update
            // For simplicity, we assume we might update the related subscription record
            // But via Prisma update of vendor, we can update relation
            // Note: Prisma relation update can be tricky if record doesn't exist.
            // Let's do a transactional update or separate simple update.
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id: user.sub },
            data: updateData,
        });

        return NextResponse.json(updatedVendor);

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
