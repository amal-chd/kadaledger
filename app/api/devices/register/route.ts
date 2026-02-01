import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function getVendorFromToken(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
        return decoded.sub;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    const vendorId = await getVendorFromToken(req);
    if (!vendorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { token, platform } = await req.json();

        if (!token || !platform) {
            return NextResponse.json({ error: 'Token and platform are required' }, { status: 400 });
        }

        const device = await prisma.device.upsert({
            where: { token },
            update: {
                lastActive: new Date(),
                vendorId: vendorId // Ensure ownership is updated if user switches account
            },
            create: {
                token,
                platform,
                vendorId,
                lastActive: new Date()
            }
        });

        return NextResponse.json({ success: true, deviceId: device.id });

    } catch (error) {
        console.error('Error registering device:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
