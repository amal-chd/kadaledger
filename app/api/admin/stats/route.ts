import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import jwt from 'jsonwebtoken';
import { getClientTimeContext, getLocalDateKey, getUtcRangeForLocalDates } from '@/lib/time-context';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function GET(req: Request) {
    try {
        // Basic Auth Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        try {
            const payload: any = jwt.verify(token, JWT_SECRET);
            if (payload.role !== 'ADMIN') {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const db = firebaseAdmin.firestore();
        const timeContext = getClientTimeContext(req);

        // Fetch Stats
        const vendorsSnapshot = await db.collection('vendors').get();
        const totalVendors = vendorsSnapshot.size;

        // Count all customers across all vendors
        let totalCustomers = 0;
        let totalPending = 0;

        for (const vendorDoc of vendorsSnapshot.docs) {
            const customersSnapshot = await db.collection('vendors').doc(vendorDoc.id).collection('customers').get();
            totalCustomers += customersSnapshot.size;

            // Calculate total pending from customer balances
            customersSnapshot.docs.forEach(customerDoc => {
                const customer = customerDoc.data();
                totalPending += Number(customer.balance || 0);
            });
        }

        // Recent Vendors (last 5)
        const recentVendorsSnapshot = await db.collection('vendors')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();

        const recentVendors = recentVendorsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: data.id || doc.id,
                businessName: data.businessName,
                phoneNumber: data.phoneNumber,
                createdAt: data.createdAt,
                subscription: data.subscription
            };
        });

        // Transactions stats for today in device local timezone
        const todayKey = getLocalDateKey(new Date(), timeContext);
        const { start: startOfDay, end: endOfDay } = getUtcRangeForLocalDates(todayKey, todayKey, timeContext);

        let todaysVolume = 0;
        let todaysCount = 0;

        for (const vendorDoc of vendorsSnapshot.docs) {
            const transactionsSnapshot = await db.collection('vendors')
                .doc(vendorDoc.id)
                .collection('transactions')
                .where('date', '>=', startOfDay)
                .where('date', '<=', endOfDay)
                .get();

            todaysCount += transactionsSnapshot.size;
            transactionsSnapshot.docs.forEach(txDoc => {
                const tx = txDoc.data();
                todaysVolume += Number(tx.amount || 0);
            });
        }

        const campaignsSnapshot = await db.collection('campaigns')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
        const devicesSnapshot = await db.collection('devices').get();
        const campaigns = campaignsSnapshot.docs.map((doc) => doc.data() as any);
        const pushSent = campaigns.reduce((sum: number, c: any) => sum + Number(c.sentCount || 0), 0);
        const pushFailed = campaigns.reduce((sum: number, c: any) => sum + Number(c.failureCount || 0), 0);

        return NextResponse.json(serializeFirestoreData({
            overview: {
                totalVendors,
                totalCustomers,
                totalPending,
                todaysVolume,
                todaysCount
            },
            push: {
                totalCampaigns: campaignsSnapshot.size,
                sentCount: pushSent,
                failedCount: pushFailed,
                activeDevices: devicesSnapshot.size
            },
            recentVendors,
            systemHealth: 'Healthy'
        }));

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
