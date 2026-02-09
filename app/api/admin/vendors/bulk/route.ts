import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';
import { normalizePlanType, getPlanDurationDays } from '@/lib/admin-plans';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;

    try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch {
        return false;
    }
}

export async function PATCH(req: Request) {
    try {
        if (!await verifyAdmin(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const vendorIds: string[] = Array.isArray(body.vendorIds) ? body.vendorIds : [];
        const action = String(body.action || '').toUpperCase();
        const value = body.value;

        if (!vendorIds.length || !action) {
            return NextResponse.json({ error: 'vendorIds and action are required' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();
        const now = new Date();
        const batch = db.batch();

        for (const vendorId of vendorIds) {
            const ref = db.collection('vendors').doc(vendorId);
            if (action === 'SET_PLAN') {
                const planType = normalizePlanType(value);
                const days = getPlanDurationDays(planType);
                batch.set(ref, {
                    plan: planType,
                    planStatus: 'ACTIVE',
                    trialStartDate: now,
                    subscriptionEndDate: days === null
                        ? new Date('2099-12-31T23:59:59.999Z')
                        : new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
                    subscription: {
                        planType,
                        status: 'ACTIVE'
                    },
                    updatedAt: now
                }, { merge: true });
            } else if (action === 'SET_STATUS') {
                const status = String(value || '').toUpperCase() === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
                batch.set(ref, {
                    planStatus: status,
                    subscription: {
                        status
                    },
                    updatedAt: now
                }, { merge: true });
            } else {
                return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
            }
        }

        await batch.commit();
        return NextResponse.json({
            success: true,
            updated: vendorIds.length,
            action
        });
    } catch (error) {
        console.error('Bulk vendor update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
