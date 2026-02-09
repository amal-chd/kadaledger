import { NextResponse } from 'next/server';
import { getJwtPayload } from '@/lib/auth';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const db = firebaseAdmin.firestore();

        // Fetch vendor data
        const vendorDoc = await db.collection('vendors').doc(vendorId).get();
        if (!vendorDoc.exists) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const vendor = vendorDoc.data();

        // Fetch all customers
        const customersSnapshot = await db.collection('vendors').doc(vendorId).collection('customers').get();
        const customers = customersSnapshot.docs.map(doc => doc.data());

        // Fetch all transactions
        const transactionsSnapshot = await db.collection('vendors').doc(vendorId).collection('transactions').get();
        const transactions = transactionsSnapshot.docs.map(doc => doc.data());

        const exportData = {
            vendor: {
                businessName: vendor?.businessName,
                phoneNumber: vendor?.phoneNumber,
                exportedAt: new Date().toISOString()
            },
            customers,
            transactions
        };

        return NextResponse.json(exportData);
    } catch (error) {
        console.error('Export data error:', error);
        return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }
}
