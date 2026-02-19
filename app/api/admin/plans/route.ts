import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';
import { SyncService } from '@/lib/sync-service';
import { ADMIN_PLAN_TYPES, normalizePlanType } from '@/lib/admin-plans';
import { serializeFirestoreData } from '@/lib/firestore-utils';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Helper to verify Admin
async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;

    try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, JWT_SECRET);
        return decoded.role === 'ADMIN';
    } catch (error) {
        return false;
    }
}

export async function GET(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = firebaseAdmin.firestore();
        const defaults = [
            { id: 'FREE', name: 'FREE', price: 0, interval: 'free', isActive: true, description: 'Free starter plan', features: ['Basic ledger', 'Up to 50 customers'] },
            { id: 'MONTHLY', name: 'MONTHLY', price: 199, interval: 'month', isActive: true, description: 'Monthly subscription', features: ['Unlimited customers', 'Campaign tools'] },
            { id: 'YEARLY', name: 'YEARLY', price: 1999, interval: 'year', isActive: true, description: 'Yearly subscription', features: ['Everything in monthly', 'Priority support'] },
            { id: 'LIFETIME', name: 'LIFETIME', price: 5999, interval: 'lifetime', isActive: true, description: 'One-time lifetime access', features: ['All features forever'] },
        ];

        const batch = db.batch();
        for (const plan of defaults) {
            const ref = db.collection('plans').doc(plan.id);
            batch.set(ref, { ...plan, updatedAt: new Date(), createdAt: new Date() }, { merge: true });
        }
        await batch.commit();

        const plansSnapshot = await db.collection('plans').get();
        const allPlans = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        // Deduplicate: keep only canonical docs, delete legacy orphans
        const canonicalMap = new Map<string, any>();
        const deleteBatch = db.batch();
        let hasDeletes = false;

        for (const plan of allPlans) {
            const normalized = normalizePlanType(plan.id || plan.name);
            if (plan.id !== normalized) {
                // This is a legacy doc (e.g. 'professional') — schedule deletion
                deleteBatch.delete(db.collection('plans').doc(plan.id));
                hasDeletes = true;
            }
            // Prefer the canonical doc over any legacy doc
            if (!canonicalMap.has(normalized) || plan.id === normalized) {
                canonicalMap.set(normalized, {
                    ...plan,
                    id: normalized,
                    name: normalized,
                });
            }
        }

        // Clean up legacy docs
        if (hasDeletes) {
            await deleteBatch.commit().catch(() => { });
        }

        const plans = ADMIN_PLAN_TYPES
            .filter(id => canonicalMap.has(id))
            .map(id => canonicalMap.get(id));
        return NextResponse.json(serializeFirestoreData(plans));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    if (!await verifyAdmin(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, price, isActive, features, description } = body;

        if (!id) {
            return NextResponse.json({ error: 'Plan ID required' }, { status: 400 });
        }

        const normalizedId = normalizePlanType(id);
        if (!ADMIN_PLAN_TYPES.includes(normalizedId)) {
            return NextResponse.json({ error: 'Unsupported plan id' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();
        const planRef = db.collection('plans').doc(normalizedId);
        const planDoc = await planRef.get();

        const base = planDoc.exists ? planDoc.data() : { id: normalizedId, name: normalizedId };

        const updateData: any = {};
        if (price !== undefined) updateData.price = Number(price);
        if (isActive !== undefined) updateData.isActive = isActive;
        if (features !== undefined) updateData.features = features;
        if (description !== undefined) updateData.description = description;
        updateData.id = normalizedId;
        updateData.name = normalizedId;
        updateData.updatedAt = new Date();

        await planRef.set(updateData, { merge: true });
        const updatedPlan = { ...base, ...updateData };

        // [SYNC] Create Snapshot of Active Plans for Clients
        const activePlansSnapshot = await db.collection('plans').where('isActive', '==', true).get();
        const allActivePlans = activePlansSnapshot.docs.map(doc => {
            const data = doc.data();
            return { name: data.name, price: data.price, interval: data.interval, id: data.id, features: data.features };
        });
        await SyncService.syncPricingPlans(allActivePlans);

        return NextResponse.json(updatedPlan);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}
