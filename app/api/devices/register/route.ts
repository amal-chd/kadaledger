import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
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
        return decoded?.sub ? String(decoded.sub) : null;
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

        const db = firebaseAdmin.firestore();
        const safeDocId = makeSafeDocId(token);
        const existingByToken = await db.collection('devices').where('token', '==', token).limit(1).get();
        const deviceRef = existingByToken.empty
            ? db.collection('devices').doc(safeDocId)
            : existingByToken.docs[0].ref;
        const deviceDoc = await deviceRef.get();

        const now = new Date();

        if (deviceDoc.exists) {
            // Update existing device
            await deviceRef.update({
                lastActive: now,
                vendorId: vendorId,
                platform,
                token
            });
        } else {
            // Create new device
            await deviceRef.set({
                id: deviceRef.id,
                token,
                platform,
                vendorId,
                lastActive: now,
                createdAt: now
            });
        }

        return NextResponse.json({ success: true, deviceId: deviceRef.id });

    } catch (error) {
        console.error('Error registering device:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function makeSafeDocId(token: string): string {
    // Firestore document IDs cannot contain "/" and some tokens contain it.
    return Buffer.from(token).toString('base64url');
}
