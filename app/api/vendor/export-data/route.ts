
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const vendorId = decoded.userId;

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
