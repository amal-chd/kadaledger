import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

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
        return { ok: true as const };
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
        const { searchParams } = new URL(req.url);
        const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '20')));

        const db = firebaseAdmin.firestore();
        const snapshot = await db.collection('campaigns')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const campaigns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(serializeFirestoreData(campaigns));
    } catch (error) {
        console.error('Campaign history fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
