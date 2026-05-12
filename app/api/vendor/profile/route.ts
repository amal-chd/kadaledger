import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

// GET: Fetch Vendor Profile
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const vendorDoc = await db.collection('vendors').doc(user.sub).get();

        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const vendor = vendorDoc.data();

        // Always return LIFETIME plan with unlimited days
        const profileData = {
            id: vendor?.id || user.sub,
            businessName: vendor?.businessName,
            phoneNumber: vendor?.phoneNumber,
            language: vendor?.language || 'English',
            subscription: {
                planType: 'LIFETIME',
                status: 'ACTIVE',
                daysLeft: 999999,
                startDate: new Date(),
                endDate: new Date('2100-01-01')
            },
            totalPending: vendor?.totalPending || 0
        };

        return NextResponse.json(serializeFirestoreData(profileData));

    } catch (error) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


// PATCH: Update Vendor Profile
export async function PATCH(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { businessName, language } = body;

        const db = firebaseAdmin.firestore();
        const updateData: any = {
            updatedAt: new Date()
        };

        if (businessName !== undefined) updateData.businessName = businessName;
        if (language !== undefined) updateData.language = language;

        await db.collection('vendors').doc(user.sub).update(updateData);

        const updatedDoc = await db.collection('vendors').doc(user.sub).get();
        return NextResponse.json(updatedDoc.data());

    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
