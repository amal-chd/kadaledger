import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ status: 'failure', message: 'Signature verification failed' }, { status: 400 });
        }

        // Payment Successful - Update Vendor Subscription
        // Note: For now, we need to know WHICH vendor paid. 
        // In a real app, we would pass vendor ID in metadata or require auth here.
        // Assuming client sends Authorization header or cookie.

        let vendorId = null;

        // Attempt to get user from token if present, otherwise we can't update subscription automatically unless passed in body
        // For simplicity in this session, let's assume the user is logged in
        const authHeader = req.headers.get('Cookie');
        // Or Authorization header if sent from client. Let's check headers.
        const authHeaderBearer = req.headers.get('Authorization');

        if (authHeaderBearer?.startsWith('Bearer ')) {
            const token = authHeaderBearer.split(' ')[1];
            try {
                const payload: any = jwt.verify(token, JWT_SECRET);
                vendorId = payload.vendorId;
            } catch (e) { /* ignore */ }
        }

        // If we have a vendorId, update their subscription
        if (vendorId) {
            // Determine plan based on amount paid or metadata (simplified here)
            // Ideally we fetched the order details or passed plan type.
            // For now, let's just mark as PROFESSIONAL if paid (logic can be improved)

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 30); // 30 Days

            await prisma.subscription.updateMany({
                where: { vendorId: vendorId },
                data: {
                    status: 'ACTIVE',
                    planType: 'PROFESSIONAL', // Defaulting to PRO for now as it's the main upgrade
                    startDate: startDate,
                    endDate: endDate
                }
            });

            // Or create if not exists (upsert logic usually better)
        }

        return NextResponse.json({ status: 'success', paymentId: razorpay_payment_id });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
    }
}
