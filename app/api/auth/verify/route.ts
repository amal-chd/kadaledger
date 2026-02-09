import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';


const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { phoneNumber, otp } = await req.json();

        if (!phoneNumber || !otp) {
            return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();

        // 1. Verify OTP
        const otpDoc = await db.collection('otps').doc(phoneNumber).get();

        if (!otpDoc.exists) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        const storedOtp = otpDoc.data();
        if (!storedOtp || storedOtp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        const expiresAt = storedOtp.expiresAt?.toDate ? storedOtp.expiresAt.toDate() : new Date(storedOtp.expiresAt);
        if (new Date() > expiresAt) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 401 });
        }

        // 2. Find or Create Vendor
        const vendorsSnapshot = await db.collection('vendors').where('phoneNumber', '==', phoneNumber).limit(1).get();

        let vendor;
        if (vendorsSnapshot.empty) {
            // Create new vendor
            const vendorRef = db.collection('vendors').doc();
            const now = new Date();
            const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

            vendor = {
                id: vendorRef.id,
                phoneNumber,
                businessName: null,
                createdAt: now,
                updatedAt: now,
                subscription: {
                    planType: 'TRIAL',
                    status: 'ACTIVE',
                    startDate: now,
                    endDate: trialEnd
                },
                totalCustomers: 0
            };

            await vendorRef.set(vendor);
        } else {
            vendor = vendorsSnapshot.docs[0].data();
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { sub: vendor.id, phone: vendor.phoneNumber },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Cleanup OTP
        await db.collection('otps').doc(phoneNumber).delete();

        return NextResponse.json({
            access_token: token,
            vendor: {
                id: vendor.id,
                phone: vendor.phoneNumber,
                businessName: vendor.businessName,
            }
        });

    } catch (error) {
        console.error('Verify error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
