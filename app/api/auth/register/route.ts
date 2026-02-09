import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { businessName, phoneNumber, password } = await req.json();
        const phoneSearchKey = normalizePhone(phoneNumber);

        if (!phoneNumber || !password || !businessName) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Check if user exists in Firestore
        const db = firebaseAdmin.firestore();
        const existingByRawPhone = await db
            .collection('vendors')
            .where('phoneNumber', '==', phoneNumber)
            .limit(1)
            .get();
        const existingBySearchKey = phoneSearchKey
            ? await db
                  .collection('vendors')
                  .where('phoneSearchKey', '==', phoneSearchKey)
                  .limit(1)
                  .get()
            : null;

        if (
            !existingByRawPhone.empty ||
            (existingBySearchKey && !existingBySearchKey.empty)
        ) {
            return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Vendor in Firestore
        const vendorRef = db.collection('vendors').doc(); // Auto-generate ID
        const vendorId = vendorRef.id;
        const now = new Date();
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

        await vendorRef.set({
            id: vendorId,
            businessName,
            phoneNumber,
            phoneSearchKey,
            password: hashedPassword,
            language: 'English',
            createdAt: now,
            updatedAt: now,
            plan: 'TRIAL',
            planStatus: 'ACTIVE',
            trialStartDate: now,
            subscriptionEndDate: trialEnd,
            preferences: {
                quietMode: false,
                quietStart: null,
                quietEnd: null,
                enabledCategories: []
            },
            totalCustomers: 0,
            totalPending: 0
        });

        // Generate JWT
        const token = jwt.sign(
            { sub: vendorId, phone: phoneNumber },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return corsResponse(NextResponse.json({
            access_token: token,
            vendor: {
                id: vendorId,
                phone: phoneNumber,
                businessName: businessName,
            }
        }));

    } catch (error) {
        console.error('Register error:', error);
        return corsResponse(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
    }
}

function normalizePhone(input: string) {
    const digits = String(input ?? '').replace(/\D/g, '');
    if (!digits) return '';
    return digits.length > 10 ? digits.slice(-10) : digits;
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
