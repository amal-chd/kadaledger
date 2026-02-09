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

async function diagnose() {
    console.log('🔍 Starting Diagnostics...\n');

    try {
        // 1. Check Vendors
        const sqlVendors = await prisma.vendor.findMany({
            select: { id: true, businessName: true, phoneNumber: true }
        });
        console.log(`📊 SQL Vendors: ${sqlVendors.length}`);

        const db = admin.firestore();
        const firestoreVendorsSnap = await db.collection('vendors').get();
        console.log(`🔥 Firestore Vendors: ${firestoreVendorsSnap.size}\n`);

        for (const vendor of sqlVendors) {
            console.log(`Checking Vendor: ${vendor.businessName} (${vendor.id})`);

            // Check Vendor Doc
            const vDoc = await db.collection('vendors').doc(vendor.id).get();
            if (!vDoc.exists) {
                console.log(`   ❌ MISING IN FIRESTORE (Vendor Doc)`);
            } else {
                console.log(`   ✅ Vendor Doc exists`);
            }

            // Check Customers
            const sqlCustCount = await prisma.customer.count({ where: { vendorId: vendor.id } });
            const fsCustSnap = await db.collection('vendors').doc(vendor.id).collection('customers').get();

            console.log(`   👥 Customers: SQL=${sqlCustCount} | Firestore=${fsCustSnap.size}`);

            if (sqlCustCount !== fsCustSnap.size) {
                console.log(`   ⚠️  MISMATCH DETECTED!`);
            } else {
                console.log(`   ✅ Match`);
            }
            console.log('---');
        }

    } catch (e) {
        console.error('Diagnostic Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
