
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import { firebaseAdmin } from '@/lib/firebase-admin';

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

        // 3. Fetch Order to get Plan Details
        console.log('[Verify] Fetching Razorpay Order:', razorpay_order_id);
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const order = await razorpay.orders.fetch(razorpay_order_id);
        console.log('[Verify] Order Fetched:', JSON.stringify(order));

        const planId = order.notes?.planId as string;
        console.log('[Verify] Plan ID from Notes:', planId);

        if (!planId) {
            console.error('[Verify] Error: Missing planId in order notes');
            return NextResponse.json({ error: 'Invalid Order: Missing Plan ID' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();

        // 4. Fetch Plan from Firestore
        console.log('[Verify] Fetching Plan from Firestore:', planId);
        const planDoc = await db.collection('plans').doc(planId).get();
        if (!planDoc.exists) {
            console.error('[Verify] Error: Plan doc does not exist');
            return NextResponse.json({ error: 'Plan not found' }, { status: 400 });
        }

        const plan = planDoc.data();
        console.log('[Verify] Plan Data:', JSON.stringify(plan));

        // 5. Calculate Subscription Dates
        const now = new Date();
        const endDate = new Date();

        const planName = plan?.name ? plan.name.toUpperCase() : '';
        const planInterval = plan?.interval || 'month';
        console.log('[Verify] Calculating dates for:', planName, planInterval);

        if (planName.includes('LIFETIME')) {
            endDate.setFullYear(endDate.getFullYear() + 100);
        } else if (planInterval === 'year') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // 6. Update Vendor Subscription in Firestore
        console.log('[Verify] Updating Vendor Subscription:', vendorId);
        const vendorRef = db.collection('vendors').doc(vendorId);
        await vendorRef.set({
            subscription: {
                planType: planName,
                status: 'ACTIVE',
                startDate: now,
                endDate: endDate
            },
            updatedAt: now
        }, { merge: true });

        console.log('[Verify] Subscription Activated Successfully');
        return NextResponse.json({ status: 'success', message: 'Subscription activated' });

    } catch (error) {
        console.error('[Verify] Payment Verification EXCEPTION:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
