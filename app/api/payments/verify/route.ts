import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Payment is successful
            // TODO: Update user subscription status in database here
            return NextResponse.json({ status: 'success' });
        } else {
            return NextResponse.json({ status: 'failure', message: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
