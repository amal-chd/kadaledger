const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Init Error:', error);
    }
}

async function migrate() {
    console.log('🚀 Starting Full Migration: MySQL -> Firestore');
    const db = admin.firestore();
    const batchSize = 500;

    try {
        // 1. VENDORS
        console.log('\n📦 Migrating Vendors...');
        const vendors = await prisma.vendor.findMany({
            include: {
                subscription: true,
                vendorPreference: true
            }
        });
        console.log(`Found ${vendors.length} vendors.`);

        for (const vendor of vendors) {
            console.log(`Processing ${vendor.businessName} (${vendor.id})...`);

            // Map Vendor Data
            const vendorRef = db.collection('vendors').doc(vendor.id);
            const vendorData = {
                id: vendor.id,
                businessName: vendor.businessName,
                phoneNumber: vendor.phoneNumber,
                password: vendor.password, // Direct copy of hash (assuming bcrypt/argon2 compatible)
                language: vendor.language || 'English',
                createdAt: vendor.createdAt,
                updatedAt: vendor.updatedAt,

                // Subscription Flattened
                plan: vendor.subscription?.planType || 'TRIAL',
                planStatus: vendor.subscription?.status || 'ACTIVE',
                trialStartDate: vendor.subscription?.startDate || vendor.createdAt,
                subscriptionEndDate: vendor.subscription?.endDate || null,

                // Preferences Flattened
                preferences: {
                    quietMode: vendor.vendorPreference?.quietMode || false,
                    quietStart: vendor.vendorPreference?.quietStart || null,
                    quietEnd: vendor.vendorPreference?.quietEnd || null,
                    enabledCategories: vendor.vendorPreference?.enabledCategories || []
                },

                // Counters (Will calculate)
                totalCustomers: 0,
                totalPending: 0
            };

            await vendorRef.set(vendorData, { merge: true });

            // 2. CUSTOMERS
            console.log(`   - Migrating Customers...`);
            const customers = await prisma.customer.findMany({
                where: { vendorId: vendor.id }
            });

            let totalPending = 0;
            let customerBatch = db.batch();
            let opCount = 0;

            for (const customer of customers) {
                const customerRef = vendorRef.collection('customers').doc(customer.id);
                customerBatch.set(customerRef, {
                    id: customer.id,
                    name: customer.name,
                    phoneNumber: customer.phoneNumber,
                    balance: customer.balance, // Important!
                    vendorId: vendor.id,
                    createdAt: customer.createdAt,
                    updatedAt: customer.updatedAt
                }, { merge: true });

                totalPending += Math.abs(customer.balance); // Track total outstanding

                opCount++;
                if (opCount >= batchSize) {
                    await customerBatch.commit();
                    customerBatch = db.batch();
                    opCount = 0;
                }

                // 3. TRANSACTIONS
                // Fetch transactions for this customer
                const transactions = await prisma.transaction.findMany({
                    where: { customerId: customer.id }
                });

                if (transactions.length > 0) {
                    // For sub-collections, we might need smaller batches or careful handling. 
                    // Let's do a separate loop or just fire promises? 
                    // Batching sub-collections is tricky if we mix with parent.
                    // Let's commit the customers first.
                }
            }
            if (opCount > 0) await customerBatch.commit();


            // Now migrate transactions in separate batches to be safe
            console.log(`   - Migrating Transactions...`);
            let txBatch = db.batch();
            let txCount = 0;

            for (const customer of customers) {
                const transactions = await prisma.transaction.findMany({
                    where: { customerId: customer.id }
                });

                for (const tx of transactions) {
                    const txRef = vendorRef
                        .collection('customers')
                        .doc(customer.id)
                        .collection('transactions')
                        .doc(tx.id);

                    txBatch.set(txRef, {
                        id: tx.id,
                        amount: tx.amount,
                        type: tx.type, // CREDIT or DEBIT/PAYMENT
                        description: tx.description,
                        date: tx.date,
                        customerId: customer.id,
                        vendorId: vendor.id,
                        createdAt: tx.date
                    });

                    txCount++;
                    if (txCount >= batchSize) {
                        await txBatch.commit();
                        txBatch = db.batch();
                        txCount = 0;
                    }
                }
            }
            if (txCount > 0) await txBatch.commit();

            // UPDATE VENDOR COUNTS
            await vendorRef.update({
                totalCustomers: customers.length,
                totalPending: totalPending // Store total outstanding/activity
            });

            console.log(`   ✅ Done. Customers: ${customers.length}, Transactions: ~`);
        }

    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
