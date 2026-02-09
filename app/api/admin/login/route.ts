import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const email = String(body?.email ?? '').trim();
        const password = String(body?.password ?? '');

        const isDefaultAdmin = (email === 'admin' || email === 'admin@kadaledger.com') && password === 'admin123';
        if (!isDefaultAdmin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const accessToken = jwt.sign(
            { sub: 'admin', role: 'ADMIN', email: email || 'admin@kadaledger.com' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            access_token: accessToken,
            role: 'ADMIN',
            message: 'Admin login successful',
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
