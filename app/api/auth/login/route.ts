import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const body = await req.json();
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

        // Find Vendor in Firestore (supports formatted phone variants)
        const db = firebaseAdmin.firestore();
        const vendorDoc = await findVendorByPhone(db, phoneNumber);

        if (!vendorDoc) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const vendor = vendorDoc.data();
        const vendorId = vendor?.id || vendorDoc.id;

        // Verify Password
        if (!vendor.password) {
            return NextResponse.json({ error: 'Please reset your password' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(password, vendor.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = jwt.sign(
            { sub: vendorId, phone: vendor.phoneNumber, role: 'VENDOR' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return corsResponse(NextResponse.json({
            access_token: token,
            role: 'VENDOR',
            vendor: {
                id: vendorId,
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

async function findVendorByPhone(
    db: FirebaseFirestore.Firestore,
    inputPhone: string
) {
    const input = String(inputPhone ?? '').trim();
    const normalizedInput = normalizePhone(input);

    if (normalizedInput) {
        const bySearchKey = await db
            .collection('vendors')
            .where('phoneSearchKey', '==', normalizedInput)
            .limit(1)
            .get();
        if (!bySearchKey.empty) {
            return bySearchKey.docs[0];
        }
    }

    const candidates = buildPhoneCandidates(input);

    for (const candidate of candidates.stringCandidates) {
        const snapshot = await db
            .collection('vendors')
            .where('phoneNumber', '==', candidate)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            return snapshot.docs[0];
        }
    }

    for (const candidate of candidates.numberCandidates) {
        const snapshot = await db
            .collection('vendors')
            .where('phoneNumber', '==', candidate)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            return snapshot.docs[0];
        }
    }

    // Fallback for legacy mixed formats in existing data.
    if (!normalizedInput) {
        return null;
    }

    const vendorsSnapshot = await db.collection('vendors').get();
    return (
        vendorsSnapshot.docs.find((doc) => {
            const phone = doc.data()?.phoneNumber;
            const normalizedStored = normalizePhone(String(phone ?? ''));
            return normalizedStored !== '' && normalizedStored === normalizedInput;
        }) ?? null
    );
}

function buildPhoneCandidates(input: string) {
    const normalized = normalizePhone(input);
    const set = new Set<string>();

    if (input) {
        set.add(input);
    }
    if (normalized) {
        set.add(normalized);
        set.add(`+${normalized}`);
        set.add(`+91${normalized}`);
        set.add(`91${normalized}`);
        set.add(`0${normalized}`);
    }

    const numberCandidates = [...set]
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0);

    return {
        stringCandidates: [...set],
        numberCandidates,
    };
}

function normalizePhone(input: string) {
    const digits = input.replace(/\D/g, '');
    if (!digits) {
        return '';
    }
    return digits.length > 10 ? digits.slice(-10) : digits;
}
