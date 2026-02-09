const { PrismaClient } = require('@prisma/client');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
require('dotenv').config();

// --- Firebase Init ---
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin Initialized');
        } else {
            console.warn('Firebase Admin: Missing environment variables.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
        process.exit(1);
    }
}

const prisma = new PrismaClient();

// --- Helper Logic ---
async function syncCustomerCount(vendorId, increment) {
    try {
        const adminDb = admin.firestore();
        const vendorRef = adminDb.collection('vendors').doc(vendorId);
        // We aren't incrementing here, we are just ensuring it's set? 
        // Actually, let's just count from DB and set it.
        const count = await prisma.customer.count({ where: { vendorId } });

        await vendorRef.set({
            totalCustomers: count
        }, { merge: true });
        // console.log(`Set count to ${count}`);
    } catch (error) {
        console.error('Firestore Sync Error (Customer Count):', error);
    }
}

async function syncCustomer(vendorId, customer) {
    try {
        const adminDb = admin.firestore();
        const custRef = adminDb
            .collection('vendors')
            .doc(vendorId)
            .collection('customers')
            .doc(customer.id);

        await custRef.set({
            id: customer.id,
            name: customer.name,
            phoneNumber: customer.phoneNumber,
            creditLimit: customer.creditLimit || 0,
            updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });

        // console.log('Sync Customer Complete');
    } catch (error) {
        console.error('Firestore Sync Error (Customer):', error);
    }
}

async function main() {
    console.log('🚀 Starting Customer Sync to Firestore...');

    // 1. Get all vendors
    const vendors = await prisma.vendor.findMany({ select: { id: true, businessName: true } });
    console.log(`Found ${vendors.length} vendors.`);

    for (const vendor of vendors) {
        console.log(`\nProcessing Vendor: ${vendor.businessName} (${vendor.id})`);

        // 2. Get all customers for this vendor
        const customers = await prisma.customer.findMany({
            where: { vendorId: vendor.id }
        });

        console.log(`Found ${customers.length} customers.`);

        // 3. Sync Count (Correctly using Count api)
        await syncCustomerCount(vendor.id, false);

        // 4. Sync Each Customer
        let synced = 0;
        for (const customer of customers) {
            await syncCustomer(vendor.id, customer);
            synced++;
            if (synced % 10 === 0) process.stdout.write('.');
        }
        console.log(`\n✅ Synced ${synced} customers for ${vendor.businessName}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
