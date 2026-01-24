import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';


const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { businessName, phoneNumber, password } = await req.json();

        if (!phoneNumber || !password || !businessName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user exists
        const existingVendor = await prisma.vendor.findUnique({
            where: { phoneNumber },
        });

        if (existingVendor) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Vendor
        const vendor = await prisma.vendor.create({
            data: {
                businessName,
                phoneNumber,
                password: hashedPassword,
                subscription: {
                    create: {
                        planType: 'TRIAL',
                        status: 'ACTIVE',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                    },
                },
            },
        });

        // Generate JWT
        const token = jwt.sign(
            { sub: vendor.id, phone: vendor.phoneNumber },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return corsResponse(NextResponse.json({
            access_token: token,
            vendor: {
                id: vendor.id,
                phone: vendor.phoneNumber,
                businessName: vendor.businessName,
            }
        }));

    } catch (error) {
        console.error('Register error:', error);
        return corsResponse(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return handleOptions();
}

function corsResponse(res: NextResponse) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
}

function handleOptions() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

