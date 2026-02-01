
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import prisma from '@/lib/prisma';
import { SyncService } from '@/lib/sync-service';
import { getJwtPayload } from '@/lib/auth'; // Optional: Use shared auth helper, but manual verify is fine too for custom logic

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ status: 'failure', message: 'Invalid signature' }, { status: 400 });
        }

        // 2. Identify User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        let vendorId: string;
        try {
            const token = authHeader.split(' ')[1];
            const decoded: any = jwt.verify(token, JWT_SECRET);
            vendorId = decoded.userId || decoded.sub;
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // 3. Fetch Order to get Plan Details (Security Fix)
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.fetch(razorpay_order_id);
        const planId = order.notes?.planId as string;

        if (!planId) {
            return NextResponse.json({ error: 'Invalid Order: Missing Plan ID' }, { status: 400 });
        }

        // 4. Fetch Plan from DB
        const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
        }

        // 5. Calculate Subscription Dates
        const now = new Date();
        const endDate = new Date();

        // Logic: Lifetime adds 100 years, Yearly adds 1 year, Monthly 1 month
        if (plan.name.toUpperCase().includes('LIFETIME')) {
            endDate.setFullYear(endDate.getFullYear() + 100);
        } else if (plan.interval === 'year') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // 6. Update Database
        const subscription = await prisma.subscription.upsert({
            where: { vendorId: vendorId },
            update: {
                planType: plan.name.toUpperCase(), // Store normalized name (e.g. LIFETIME, MONTHLY)
                status: 'ACTIVE',
                startDate: now,
                endDate: endDate
            },
            create: {
                vendorId: vendorId,
                planType: plan.name.toUpperCase(),
                status: 'ACTIVE',
                startDate: now,
                endDate: endDate
            }
        });

        // 7. [SYNC] Double-Write to Firestore
        await SyncService.syncSubscription(vendorId, subscription);

        return NextResponse.json({ status: 'success', message: 'Subscription activated' });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
