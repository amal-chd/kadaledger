import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';


const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function POST(req: Request) {
    try {
        const { phoneNumber, otp } = await req.json();

        if (!phoneNumber || !otp) {
            return NextResponse.json({ error: 'Phone number and OTP are required' }, { status: 400 });
        }

        // 1. Verify OTP
        const storedOtp = await prisma.otp.findUnique({
            where: { phone: phoneNumber },
        });

        if (!storedOtp || storedOtp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        if (new Date() > storedOtp.expiresAt) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 401 });
        }

        // 2. Find or Create Vendor
        // We treat every login as a potential registration if the vendor doesn't exist
        let vendor = await prisma.vendor.findUnique({
            where: { phoneNumber },
        });

        if (!vendor) {
            vendor = await prisma.vendor.create({
                data: {
                    phoneNumber,
                    // Optional: Create a default trial subscription
                    subscription: {
                        create: {
                            planType: 'TRIAL',
                            status: 'ACTIVE',
                            startDate: new Date(),
                            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
                        },
                    },
                },
            });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { sub: vendor.id, phone: vendor.phoneNumber },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Cleanup OTP
        await prisma.otp.delete({ where: { phone: phoneNumber } });

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
