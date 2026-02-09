import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';
import jwt from 'jsonwebtoken';
import { normalizePlanType } from '@/lib/admin-plans';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

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
    try {
        const isAdmin = await verifyAdmin(req);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const plan = String(searchParams.get('plan') || 'ALL').toUpperCase();
        const status = String(searchParams.get('status') || 'ALL').toUpperCase();
        const sortBy = String(searchParams.get('sortBy') || 'createdAt').toLowerCase();
        const sortOrder = String(searchParams.get('sortOrder') || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const db = firebaseAdmin.firestore();
        const vendorsSnapshot = await db.collection('vendors').get();

        let vendors = vendorsSnapshot.docs.map(doc => doc.data() as any);

        vendors = vendors.map((v: any) => {
            const normalizedPlan = normalizePlanType(v?.subscription?.planType || v?.plan || 'FREE');
            const normalizedStatus = String(v?.subscription?.status || v?.planStatus || 'ACTIVE').toUpperCase();
            return {
                ...v,
                subscription: {
                    ...(v.subscription || {}),
                    planType: normalizedPlan,
                    status: normalizedStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
                }
            };
        });

        // Filter by search if provided
        if (search) {
            const searchLower = search.toLowerCase();
            vendors = vendors.filter(v =>
                v.businessName?.toLowerCase().includes(searchLower) ||
                String(v.phoneNumber ?? '').toLowerCase().includes(searchLower)
            );
        }

        if (plan !== 'ALL') {
            vendors = vendors.filter((v: any) => v.subscription?.planType === plan);
        }

        if (status !== 'ALL') {
            vendors = vendors.filter((v: any) => v.subscription?.status === status);
        }

        const total = vendors.length;

        // Calculate stats for each vendor
        const vendorsWithStats = await Promise.all(vendors.map(async (vendor: any) => {
            const customersSnapshot = await db.collection('vendors').doc(vendor.id).collection('customers').get();
            const transactionsSnapshot = await db.collection('vendors').doc(vendor.id).collection('transactions').get();

            let totalPending = 0;
            customersSnapshot.docs.forEach(custDoc => {
                const customer = custDoc.data();
                totalPending += Number(customer.balance || 0);
            });

            const createdAt = vendor.createdAt?.toDate ? vendor.createdAt.toDate() : new Date(vendor.createdAt || Date.now());
            return {
                ...vendor,
                customerCount: customersSnapshot.size,
                transactionCount: transactionsSnapshot.size,
                totalPending,
                createdAt
            };
        }));

        vendorsWithStats.sort((a: any, b: any) => {
            const direction = sortOrder === 'asc' ? 1 : -1;
            if (sortBy === 'pending') {
                return (Number(a.totalPending || 0) - Number(b.totalPending || 0)) * direction;
            }
            if (sortBy === 'customers') {
                return (Number(a.customerCount || 0) - Number(b.customerCount || 0)) * direction;
            }
            if (sortBy === 'transactions') {
                return (Number(a.transactionCount || 0) - Number(b.transactionCount || 0)) * direction;
            }
            const aDate = new Date(a.createdAt || 0).getTime();
            const bDate = new Date(b.createdAt || 0).getTime();
            return (aDate - bDate) * direction;
        });

        // Pagination
        const skip = (page - 1) * limit;
        const paginatedVendors = vendorsWithStats.slice(skip, skip + limit);

        // Serialize all Firestore Timestamps to ISO strings
        const serializedVendors = serializeFirestoreData(paginatedVendors);

        return NextResponse.json({
            data: serializedVendors,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                filters: { plan, status, sortBy, sortOrder, search }
            }
        });

    } catch (error) {
        console.error('Admin vendors fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
