import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const body = await req.json();
        const { planName } = body;

        if (!planName) {
            return NextResponse.json({ error: 'Plan Name is required' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();

        // Fetch Plan from Firestore
        const plansSnapshot = await db.collection('plans')
            .where('name', '==', planName)
            .limit(1)
            .get();

        if (plansSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid Plan' }, { status: 404 });
        }

        const plan = plansSnapshot.docs[0].data();

        if (!plan.isActive) {
            return NextResponse.json({ error: 'This plan is currently unavailable' }, { status: 400 });
        }

        const amount = plan.price;

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                planId: plan.id,
                planName: plan.name
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            ...order,
            planName: plan.name,
            price: plan.price
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
