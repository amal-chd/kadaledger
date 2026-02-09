import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { normalizePlanType } from '@/lib/admin-plans';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

type CampaignTarget = 'ALL' | 'PAID' | 'FREE';

function normalizeTarget(input: string): CampaignTarget {
    const value = String(input || '').toUpperCase();
    if (value === 'PAID' || value === 'FREE') return value;
    return 'ALL';
}

function isPaidVendor(vendor: any) {
    const planType = normalizePlanType(vendor?.subscription?.planType || vendor?.plan || 'FREE');
    const status = String(vendor?.subscription?.status || vendor?.planStatus || 'ACTIVE').toUpperCase();
    return status === 'ACTIVE' && planType !== 'FREE';
}

function isFreeVendor(vendor: any) {
    return !isPaidVendor(vendor);
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
        return { ok: true, payload };
    } catch {
        return { ok: false, status: 401 as const, error: 'Invalid token' };
    }
}

export async function POST(req: Request) {
    const auth = await verifyAdmin(req);
    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const title = String(body?.title ?? '').trim();
        const message = String(body?.body ?? '').trim();
        const target = normalizeTarget(body?.target ?? 'ALL');
        const mode = String(body?.mode || 'BROADCAST').toUpperCase(); // BROADCAST | TEST
        const testToken = String(body?.testToken || '').trim();
        const testVendorId = String(body?.testVendorId || '').trim();

        if (!title || !message) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();
        const adminSettings = await db.collection('admin').doc('settings').get();
        const campaignsEnabled = adminSettings.exists ? adminSettings.data()?.campaignsEnabled !== false : true;
        if (!campaignsEnabled) {
            return NextResponse.json({ error: 'Campaigns are disabled in admin settings' }, { status: 403 });
        }

        const vendorsSnapshot = await db.collection('vendors').get();
        const targetVendors = vendorsSnapshot.docs
            .map((doc) => ({ docId: doc.id, id: doc.id, ...doc.data() }))
            .filter((vendor: any) => {
                if (target === 'PAID') return isPaidVendor(vendor);
                if (target === 'FREE') return isFreeVendor(vendor);
                return true;
            });

        const targetVendorIds = new Set<string>();
        targetVendors.forEach((v: any) => {
            const docId = String(v.docId || '').trim();
            const dataId = String(v.id || '').trim();
            if (docId) targetVendorIds.add(docId);
            if (dataId) targetVendorIds.add(dataId);
        });

        const devicesSnapshot = await db.collection('devices').get();
        let targetDevices = devicesSnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((device: any) => targetVendorIds.has(String(device.vendorId || '').trim()));

        if (mode === 'TEST') {
            targetDevices = targetDevices.filter((device: any) => {
                if (testToken) {
                    return String(device.token || '').trim() === testToken;
                }
                if (testVendorId) {
                    return String(device.vendorId || '').trim() === testVendorId;
                }
                return false;
            });
        }

        const tokens = Array.from(
            new Set(targetDevices.map((d: any) => String(d.token || '').trim()).filter(Boolean))
        );

        if (mode === 'TEST' && !tokens.length) {
            return NextResponse.json({ error: 'No active test device found. Provide a valid test vendor ID or token.' }, { status: 400 });
        }

        const campaignRef = db.collection('campaigns').doc();
        const now = new Date();

        let sentCount = 0;
        let failureCount = 0;
        const invalidTokens: string[] = [];

        if (tokens.length > 0) {
            const response = await firebaseAdmin.messaging().sendEachForMulticast({
                tokens,
                notification: {
                    title,
                    body: message,
                },
                data: {
                    type: 'CAMPAIGN',
                    title,
                    body: message,
                    target,
                    campaignId: campaignRef.id,
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: 'notification_system',
                        priority: 'max',
                    },
                },
                apns: {
                    headers: { 'apns-priority': '10' },
                    payload: {
                        aps: {
                            alert: {
                                title,
                                body: message,
                            },
                            sound: 'default',
                            badge: 1,
                            contentAvailable: true,
                        },
                    },
                },
            });

            sentCount = response.successCount;
            failureCount = response.failureCount;

            response.responses.forEach((result, index) => {
                if (!result.success) {
                    const token = tokens[index];
                    const code = result.error?.code || '';
                    if (
                        code.includes('invalid-registration-token') ||
                        code.includes('registration-token-not-registered')
                    ) {
                        invalidTokens.push(token);
                    }
                }
            });
        }

        if (invalidTokens.length > 0) {
            const batch = db.batch();
            invalidTokens.forEach((token) => {
                batch.delete(db.collection('devices').doc(token));
            });
            await batch.commit();
        }

        await campaignRef.set({
            id: campaignRef.id,
            title,
            message,
            target,
            mode,
            createdAt: now,
            sentCount,
            failureCount,
            totalDevices: tokens.length,
            status: tokens.length > 0 ? 'SENT' : 'NO_ACTIVE_DEVICES',
            testVendorId: testVendorId || null,
        });

        if (mode !== 'TEST') {
            const notificationWriteBatch = db.batch();
            targetVendors.forEach((vendor: any) => {
                const ref = db.collection('vendors').doc(vendor.id).collection('notifications').doc();
                notificationWriteBatch.set(ref, {
                    id: ref.id,
                    title,
                    message,
                    type: 'campaign',
                    source: 'admin_campaign',
                    campaignId: campaignRef.id,
                    read: false,
                    createdAt: now,
                });
            });
            await notificationWriteBatch.commit();
        }

        return NextResponse.json({
            success: true,
            campaignId: campaignRef.id,
            sentCount,
            failureCount,
            totalDevices: tokens.length,
            targetDevices: targetDevices.length,
            targetVendors: mode === 'TEST'
                ? new Set(targetDevices.map((d: any) => String(d.vendorId || ''))).size
                : targetVendors.length,
            note: tokens.length === 0
                ? 'Campaign recorded and in-app notifications created, but no active push tokens were found.'
                : undefined,
        });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
