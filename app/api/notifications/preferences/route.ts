import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

function buildDefaultPreferences() {
    return {
        quietMode: false,
        quietStart: '22:00',
        quietEnd: '07:00',
        enabledCategories: ['SUMMARY', 'RISK', 'REMINDER', 'SYSTEM', 'INACTIVITY', 'PROMO'],
    };
}

export async function GET() {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const vendorRef = db.collection('vendors').doc(user.sub);
        const vendorDoc = await vendorRef.get();

        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const vendor = vendorDoc.data() || {};
        const preferences = {
            ...buildDefaultPreferences(),
            ...(vendor.preferences || {}),
        };

        return NextResponse.json(serializeFirestoreData(preferences));
    } catch (error) {
        console.error('Preferences fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function updatePreferences(req: Request) {
    const user = await getJwtPayload();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const db = firebaseAdmin.firestore();
    const vendorRef = db.collection('vendors').doc(user.sub);

    const update = {
        preferences: {
            ...buildDefaultPreferences(),
            ...(body || {}),
        },
        updatedAt: new Date(),
    };

    await vendorRef.set(update, { merge: true });

    return NextResponse.json({ success: true, preferences: serializeFirestoreData(update.preferences) });
}

export async function PATCH(req: Request) {
    try {
        return await updatePreferences(req);
    } catch (error) {
        console.error('Preferences update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        return await updatePreferences(req);
    } catch (error) {
        console.error('Preferences update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
