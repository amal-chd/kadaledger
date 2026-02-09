import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from '@/lib/firebase-admin';

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

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const { id } = await params;
        const db = firebaseAdmin.firestore();
        const campaignDoc = await db.collection('campaigns').doc(id).get();
        if (!campaignDoc.exists) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }
        const campaign = campaignDoc.data() || {};

        const internalReq = new Request(new URL('/api/notifications/send', req.url).toString(), {
            method: 'POST',
            headers: req.headers,
            body: JSON.stringify({
                title: campaign.title || '',
                body: campaign.message || '',
                target: campaign.target || 'ALL',
                mode: campaign.mode || 'BROADCAST',
                testVendorId: campaign.testVendorId || undefined,
            }),
        });

        const response = await fetch(internalReq);
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        await db.collection('campaigns').doc(id).set({
            retriedAt: new Date(),
            lastRetryCampaignId: data.campaignId || null,
        }, { merge: true });

        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        console.error('Campaign retry error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
