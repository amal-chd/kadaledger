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
        if (decoded.role !== 'VENDOR' && decoded.role !== 'ADMIN') { // Allow Admin too if needed
            return null;
        }
        return decoded.sub; // vendorId
    } catch (error) {
        return null;
    }
}

export async function GET(req: Request) {
    const vendorId = await getVendorFromToken(req);
    if (!vendorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const prefs = await prisma.vendorPreference.findUnique({
            where: { vendorId },
        });

        if (!prefs) {
            // Return defaults if no prefs exist
            return NextResponse.json({
                quietMode: false,
                quietStart: "22:00",
                quietEnd: "07:00",
                enabledCategories: ["SUMMARY", "RISK", "REMINDER", "SYSTEM", "INACTIVITY", "PROMO"]
            });
        }

        return NextResponse.json(prefs);

    } catch (error) {
        console.error('Error fetching preferences:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const vendorId = await getVendorFromToken(req);
    if (!vendorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Validation could be added here

        const prefs = await prisma.vendorPreference.upsert({
            where: { vendorId },
            update: {
                quietMode: body.quietMode,
                quietStart: body.quietStart,
                quietEnd: body.quietEnd,
                enabledCategories: body.enabledCategories, // Expecting JSON array
            },
            create: {
                vendorId,
                quietMode: body.quietMode ?? false,
                quietStart: body.quietStart ?? "22:00",
                quietEnd: body.quietEnd ?? "07:00",
                enabledCategories: body.enabledCategories ?? ["SUMMARY", "RISK", "REMINDER", "SYSTEM", "INACTIVITY", "PROMO"]
            }
        });

        return NextResponse.json(prefs);

    } catch (error) {
        console.error('Error updating preferences:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
