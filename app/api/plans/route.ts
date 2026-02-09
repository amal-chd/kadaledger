import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const db = firebaseAdmin.firestore();
        // Fetch all plans and filter/sort in memory to avoid composite index requirement
        const plansSnapshot = await db.collection('plans').get();

        const plans = plansSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((plan: any) => plan.isActive === true)
            .sort((a: any, b: any) => (a.price || 0) - (b.price || 0));

        return NextResponse.json(plans);
    } catch (error) {
        console.error('API PLANS ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch plans', details: String(error) }, { status: 500 });
    }
}
