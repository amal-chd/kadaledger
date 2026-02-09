import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export async function GET() {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const notificationsSnapshot = await db
            .collection('vendors')
            .doc(user.sub)
            .collection('notifications')
            .orderBy('createdAt', 'desc')
            .limit(100)
            .get();

        const notifications = notificationsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(serializeFirestoreData(notifications));
    } catch (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
