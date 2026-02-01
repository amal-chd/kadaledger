import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

async function getVendorFromToken(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string, role: string };
        return decoded.sub; // This is the vendorId
    } catch (error) {
        return null;
    }
}

export async function GET(req: Request) {
    const vendorId = await getVendorFromToken(req);
    if (!vendorId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Fetch Vendor Details (for target filtering)
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: { subscription: true }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        const isPaid = vendor.subscription?.status === 'ACTIVE' && vendor.subscription?.planType !== 'TRIAL';
        const isFree = !isPaid;

        // 2. Fetch Personal Notifications (NotificationLog)
        const personalNotifications = await prisma.notificationLog.findMany({
            where: { vendorId },
            orderBy: { sentAt: 'desc' },
            take: 50
        });

        // 3. Fetch Broadcast Campaigns (PushCampaign)
        // ALL, plus matching PAID/FREE status
        const campaignConditions = [
            { target: 'ALL' },
            ...(isPaid ? [{ target: 'PAID' }] : []),
            ...(isFree ? [{ target: 'FREE' }] : [])
        ];

        const campaigns = await prisma.pushCampaign.findMany({
            where: {
                status: 'SENT',
                OR: campaignConditions
            },
            orderBy: { sentAt: 'desc' },
            take: 20 // Last 20 broadcasts
        });

        // 4. Merge and Format
        const formattedPersonal = personalNotifications.map((n: any) => ({
            id: n.id,
            title: n.title,
            body: n.body,
            type: n.type,
            date: n.sentAt,
            isGlobal: false,
            read: false
        }));

        const formattedCampaigns = campaigns.map((c: any) => ({
            id: c.id,
            title: c.title,
            body: c.body,
            type: 'SYSTEM', // Campaigns are usually system announcements
            date: c.sentAt || c.createdAt,
            isGlobal: true,
            read: false
        }));

        const allNotifications = [...formattedPersonal, ...formattedCampaigns]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 50); // Cap total list

        return NextResponse.json(allNotifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
