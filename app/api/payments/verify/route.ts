
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth'; // Optional: Use shared auth helper, but manual verify is fine too for custom logic

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = await req.json();

        // 1. Signature Verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ status: 'failure', message: 'Invalid signature' }, { status: 400 });
        }

        // 2. Identify User from Header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const vendorId = decoded.userId || decoded.sub; // Handle both standard JWT claims

        // 3. Update Database
        // Determine plan details
        // Default to MONTHLY if not specified or unknown
        const isYearly = planType === 'professional_yearly' || planType?.includes('yearly');

        // Calculate dates
        const now = new Date();
        const endDate = new Date();
        if (isYearly) {
            endDate.setFullYear(endDate.getFullYear() + 1);
            // Add 2 months extra if that was the deal? Or just 1 year. 
            // The deal "2 months free" usually means price is 10mo cost for 12mo duration.
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        await prisma.subscription.upsert({
            where: { vendorId: vendorId },
            update: {
                planType: isYearly ? 'YEARLY' : 'MONTHLY',
                status: 'ACTIVE',
                startDate: now,
                endDate: endDate
            },
            create: {
                vendorId: vendorId,
                planType: isYearly ? 'YEARLY' : 'MONTHLY',
                status: 'ACTIVE',
                startDate: now,
                endDate: endDate
            }
        });

        return NextResponse.json({ status: 'success', message: 'Subscription activated' });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
