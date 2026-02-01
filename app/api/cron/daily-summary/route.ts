import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    // 1. Security Check (Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // In dev, we might relax this or use a manual secret
        // For now, allow if in local dev or if secret matches
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        console.log("Staring Daily Summary Cron...");

        // 2. Fetch Active Vendors with Preferences & Devices
        // Optimization: Only fetch vendors who have NOT disabled 'SUMMARY'
        // and have at least one device.
        const vendors = await prisma.vendor.findMany({
            where: {
                devices: { some: {} }, // Must have a device
            },
            include: {
                devices: true,
                vendorPreference: true,
                customers: {
                    select: { balance: true } // Only need balance for summary
                }
            }
        });

        console.log(`Found ${vendors.length} vendors for potential summary.`);

        let sentCount = 0;

        for (const vendor of vendors) {
            // Check Preferences (Default to enabled if no prefs exist)
            const enabledCategories = (vendor.vendorPreference?.enabledCategories as string[]) || ["SUMMARY", "RISK", "REMINDER", "SYSTEM", "INACTIVITY", "PROMO"];
            if (!enabledCategories.includes('SUMMARY')) {
                continue;
            }

            // Calculate Stats
            const totalOutstanding = vendor.customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
            const unpaidCount = vendor.customers.filter(c => c.balance > 0).length;

            if (totalOutstanding <= 0) {
                // Option: Maybe skip if nothing to report? Or send "All clear!" 
                // Let's send a "Great Job" message occasionally or nothing.
                // For now, skip to reduce spam.
                continue;
            }

            const title = "Daily Business Summary";
            const body = `You present outstanding is ₹${totalOutstanding.toFixed(0)} from ${unpaidCount} customers. Tap to view details.`;

            // Deduplicate tokens
            const tokens = Array.from(new Set(vendor.devices.map(d => d.token)));

            if (tokens.length > 0) {
                await firebaseAdmin.messaging().sendEachForMulticast({
                    tokens,
                    notification: { title, body },
                    data: {
                        type: 'SUMMARY',
                        click_action: 'FLUTTER_NOTIFICATION_CLICK',
                        amount: totalOutstanding.toString(),
                    }
                });
                sentCount++;

                // Log (Selective logging to avoid massive table growth)
                await prisma.notificationLog.create({
                    data: {
                        vendorId: vendor.id,
                        type: 'SUMMARY',
                        title,
                        body,
                        metadata: { amount: totalOutstanding, customerCount: unpaidCount }
                    }
                });
            }
        }

        return NextResponse.json({ success: true, processed: vendors.length, sent: sentCount });

    } catch (error) {
        console.error('Daily Summary Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
