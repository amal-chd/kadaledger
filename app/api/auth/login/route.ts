import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';


const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('Login Request Body:', body);
        const { phoneNumber, password } = body;

        if (!phoneNumber || !password) {
            return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
        }

        // Check for admin credentials first
        if (phoneNumber === 'admin' && password === 'admin123') {
            const adminToken = jwt.sign(
                { sub: 'admin', role: 'ADMIN', phoneNumber: 'admin' },
                JWT_SECRET,
                { expiresIn: '7d' }
            );
            return corsResponse(NextResponse.json({
                access_token: adminToken,
                role: 'ADMIN',
                message: 'Admin login successful'
            }));
        }

        // Find Vendor
        const vendor = await prisma.vendor.findUnique({
            where: { phoneNumber },
        });

        if (!vendor) {
            console.log('Login failed: Vendor not found for phone:', phoneNumber);
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        console.log('Vendor found:', vendor.id);

        // Verify Password
        // Handle migration case: if password is null/empty in DB (shouldn't happen with new schema but good safety)
        if (!vendor.password) {
            return NextResponse.json({ error: 'Please reset your password' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(password, vendor.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = jwt.sign(
            { sub: vendor.id, phone: vendor.phoneNumber, role: 'VENDOR' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return corsResponse(NextResponse.json({
            access_token: token,
            role: 'VENDOR',
            vendor: {
                id: vendor.id,
                phone: vendor.phoneNumber,
                businessName: vendor.businessName,
            }
        }));

    } catch (error) {
        console.error('Login error:', error);
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

