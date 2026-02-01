import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { firebaseAdmin } from '@/lib/firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function getAdminFromToken(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
        if (decoded.role !== 'ADMIN') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    const admin = await getAdminFromToken(req);
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    try {
        const { title, body, target, topic } = await req.json();

        if (!title || !body) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        // 1. Fetch Target Devices
        let whereClause = {};
        if (target === 'PAID') {
            whereClause = {
                vendor: {
                    subscription: {
                        status: 'ACTIVE',
                        planType: { not: 'TRIAL' }
                    }
                }
            };
        } else if (target === 'FREE') {
            whereClause = {
                vendor: {
                    OR: [
                        { subscription: null },
                        { subscription: { status: 'EXPIRED' } },
                        { subscription: { planType: 'TRIAL' } }
                    ]
                }
            };
        }
        // 'ALL' needs no filter on vendor

        const devices = await prisma.device.findMany({
            where: whereClause,
            select: { token: true, vendorId: true }
        });

        if (devices.length === 0) {
            return NextResponse.json({ message: 'No devices found for target', count: 0 });
        }

        const tokens = devices.map(d => d.token);
        // Deduplicate tokens
        const uniqueTokens = Array.from(new Set(tokens));

        // 2. Send via Firebase
        // Batched sending (max 500 per batch recommended, simplified here)
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
            tokens: uniqueTokens,
            notification: {
                title,
                body,
            },
            data: {
                type: 'SYSTEM', // Generic system notification
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
        });

        // 3. Log System Notification
        // Since we might send to many, maybe just log the Campaign/Bulk action? 
        // Or log individually if crucial. For now, logging the campaign action.

        await prisma.pushCampaign.create({
            data: {
                title,
                body,
                target: target || 'ALL',
                status: 'SENT',
                sentAt: new Date(),
                metadata: {
                    successCount: response.successCount,
                    failureCount: response.failureCount,
                }
            }
        });

        // Also log to NotificationLog for audit? Maybe too heavy for bulk.
        // Let's stick to Campaign log for admin blasts.

        return NextResponse.json({
            success: true,
            sentCount: response.successCount,
            failureCount: response.failureCount,
            totalMatched: uniqueTokens.length
        });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
    }
}
