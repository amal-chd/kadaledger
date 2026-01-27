
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtPayload } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const vendorId = user.sub;
        const backupData = await req.json();

        if (!backupData || !backupData.customers || !backupData.transactions) {
            return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
        }

        // Transactional Restore
        await prisma.$transaction(async (tx) => {
            // 1. Restore/Upsert Customers
            // strategy: match by phoneNumber + vendorId
            // We strip IDs to let DB generate new ones OR keep them if necessary.
            // Keeping IDs is risky for conflicts if restoring to diff account, 
            // but for same acc it's ok. Let's rely on phone number uniqueness per vendor.

            const customerMap = new Map<string, string>(); // Old ID -> New ID

            for (const cust of backupData.customers) {
                // If customer exists, update balance? Or skip?
                // Let's upsert based on phone
                if (!cust.phoneNumber) continue;

                const upserted = await tx.customer.upsert({
                    where: {
                        vendorId_phoneNumber: {
                            vendorId: vendorId,
                            phoneNumber: cust.phoneNumber
                        }
                    },
                    update: {
                        name: cust.name,
                        balance: parseFloat(cust.balance.toString()) // Ensure float
                    },
                    create: {
                        vendorId: vendorId,
                        name: cust.name,
                        phoneNumber: cust.phoneNumber,
                        balance: parseFloat(cust.balance.toString())
                    }
                });
                customerMap.set(cust.id, upserted.id);
            }

            // 2. Restore Transactions
            // We need to map old Customer IDs to New Customer IDs.
            // And avoid duplicate transactions? Check ID?
            // If importing from same system, IDs might collide.
            // Safer: Create NEW transactions always, but check for duplicates based on (date, amount, type, customerId)
            // Or simpler for MVP: Just insert all. (Risk of dupes if run twice!)

            // Deduplication Check Strategy: Simple check if ID exists

            for (const trx of backupData.transactions) {
                const newCustomerId = customerMap.get(trx.customerId);
                if (!newCustomerId) continue; // Orphan transaction

                // Check if this transaction ID already exists for this vendor
                // If backing up from same DB, IDs match.
                const existing = await tx.transaction.findUnique({
                    where: { id: trx.id }
                });

                if (!existing) {
                    await tx.transaction.create({
                        data: {
                            // We can try to keep ID if UUID valid, else let auto-gen
                            // For history sync, keeping original date is crucial
                            amount: parseFloat(trx.amount.toString()),
                            type: trx.type,
                            description: trx.description,
                            date: new Date(trx.date),
                            vendorId: vendorId,
                            customerId: newCustomerId
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true, message: 'Restore completed successfully' });

    } catch (error) {
        console.error('Import Error:', error);
        return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
    }
}
