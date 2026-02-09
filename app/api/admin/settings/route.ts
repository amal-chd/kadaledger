import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';
import { serializeFirestoreData } from '@/lib/firestore-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

function getDefaults() {
    return {
        maintenanceMode: false,
        maintenanceMessage: 'System maintenance in progress. Please try again later.',
        supportEmail: 'admin@kadaledger.com',
        campaignsEnabled: true,
        updatedAt: new Date(),
    };
}

async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return { ok: false, status: 401 as const, error: 'Unauthorized' };
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload: any = jwt.verify(token, JWT_SECRET);
        if (payload.role !== 'ADMIN') {
            return { ok: false, status: 403 as const, error: 'Forbidden' };
        }
        return { ok: true };
    } catch {
        return { ok: false, status: 401 as const, error: 'Invalid token' };
    }
}

export async function GET(req: Request) {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const db = firebaseAdmin.firestore();
        const ref = db.collection('admin').doc('settings');
        const snap = await ref.get();

        if (!snap.exists) {
            const defaults = getDefaults();
            await ref.set(defaults);
            return NextResponse.json(serializeFirestoreData(defaults));
        }

        return NextResponse.json(serializeFirestoreData({ ...getDefaults(), ...snap.data() }));
    } catch (error) {
        console.error('Admin settings fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const db = firebaseAdmin.firestore();
        const ref = db.collection('admin').doc('settings');

        const updateData = {
            ...body,
            updatedAt: new Date(),
        };

        await ref.set(updateData, { merge: true });
        const updated = await ref.get();

        return NextResponse.json({ success: true, settings: serializeFirestoreData(updated.data() || {}) });
    } catch (error) {
        console.error('Admin settings update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
