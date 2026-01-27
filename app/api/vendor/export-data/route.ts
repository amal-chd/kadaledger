
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;

        // Fetch all relevant data
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                subscription: true,
                customers: true,
                transactions: true,
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Structure the backup bundle
        const backupData = {
            metadata: {
                version: '1.0',
                timestamp: new Date().toISOString(),
                exportedBy: vendorId,
            },
            vendor: {
                businessName: vendor.businessName,
                phoneNumber: vendor.phoneNumber,
                // Do not export sensitive Auth data like password hash if possible, 
                // but needed if full restore on new db. For now, we skip password/secrets for safety.
                language: vendor.language,
                createdAt: vendor.createdAt,
            },
            subscription: vendor.subscription,
            customers: vendor.customers,
            transactions: vendor.transactions,
        };

        return NextResponse.json(backupData);

    } catch (error) {
        console.error('Export Error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
