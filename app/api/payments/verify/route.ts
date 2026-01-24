import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, vendorId: bodyVendorId } = body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ status: 'failure', message: 'Signature verification failed' }, { status: 400 });
        }

        // Payment Successful - Update Vendor Subscription

        let vendorId = null;

        // 1. Try to get vendorId from Token (Preferred)
        const authHeaderBearer = req.headers.get('Authorization');

        if (authHeaderBearer?.startsWith('Bearer ')) {
            const token = authHeaderBearer.split(' ')[1];
            try {
                const payload: any = jwt.verify(token, JWT_SECRET);
                vendorId = payload.vendorId;
            } catch (e) { /* ignore */ }
        }

        // 2. Fallback to vendorId from body (for mobile if auth header fails/missing)
        if (!vendorId && bodyVendorId) {
            vendorId = bodyVendorId;
        }

        // If we have a vendorId, update their subscription
        if (vendorId) {
            const targetPlan = plan ? plan.toUpperCase() : 'PROFESSIONAL';
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30); // 30 Days

            await prisma.subscription.updateMany({
                where: { vendorId: vendorId },
                data: {
                    status: 'ACTIVE',
                    planType: targetPlan,
                    startDate: startDate,
                    endDate: endDate
                }
            });
        }

        // Or create if not exists (upsert logic usually better)

        return NextResponse.json({ status: 'success', paymentId: razorpay_payment_id });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
    }
}
