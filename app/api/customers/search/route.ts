import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([]);
        }

        const db = firebaseAdmin.firestore();
        const customersSnapshot = await db.collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .orderBy('updatedAt', 'desc')
            .get();

        const queryLower = query.toLowerCase();
        const customers = customersSnapshot.docs
            .map(doc => doc.data())
            .filter(c =>
                c.name?.toLowerCase().includes(queryLower) ||
                c.phoneNumber?.toLowerCase().includes(queryLower)
            )
            .slice(0, 5);

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Search customers error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
