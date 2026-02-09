const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
    console.log('Firebase Admin Initialized');
}

async function seedFirestore() {
    const db = admin.firestore();

    // Create a test vendor with a known ID that matches your JWT token
    // You'll need to replace this with your actual vendor ID from your JWT
    const vendorId = '2f48c42f-a2c0-4b73-bdac-17a608335fc9'; // Replace with your vendor ID

    console.log('Seeding vendor:', vendorId);

    // Create vendor document
    await db.collection('vendors').doc(vendorId).set({
        id: vendorId,
        phoneNumber: '+1234567890',
        businessName: 'Test Business',
        createdAt: new Date(),
        updatedAt: new Date(),
        totalCustomers: 3,
        subscription: {
            planType: 'TRIAL',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
    });
    console.log('✓ Vendor created');

    // Create sample customers
    const customers = [
        { name: 'John Doe', phoneNumber: '+1111111111', balance: 5000 },
        { name: 'Jane Smith', phoneNumber: '+2222222222', balance: 3500 },
        { name: 'Bob Johnson', phoneNumber: '+3333333333', balance: 2000 }
    ];

    for (const customer of customers) {
        const customerRef = db.collection('vendors').doc(vendorId).collection('customers').doc();
        await customerRef.set({
            id: customerRef.id,
            vendorId: vendorId,
            ...customer,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log(`✓ Customer created: ${customer.name}`);

        // Create sample transactions for each customer
        const transactions = [
            { type: 'CREDIT', amount: 5000, description: 'Initial credit', daysAgo: 10 },
            { type: 'PAYMENT', amount: 2000, description: 'Payment received', daysAgo: 5 },
            { type: 'CREDIT', amount: 3000, description: 'Additional credit', daysAgo: 2 }
        ];

        for (const tx of transactions) {
            const txRef = db.collection('vendors').doc(vendorId).collection('transactions').doc();
            const txDate = new Date();
            txDate.setDate(txDate.getDate() - tx.daysAgo);

            await txRef.set({
                id: txRef.id,
                vendorId: vendorId,
                customerId: customerRef.id,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                date: txDate,
                createdAt: txDate
            });
        }
    }
    console.log('✓ Transactions created');

    // Create sample pricing plans
    const plans = [
        { name: 'Trial', price: 0, interval: 'month', isActive: true },
        { name: 'Monthly', price: 499, interval: 'month', isActive: true },
        { name: 'Yearly', price: 4999, interval: 'year', isActive: true },
        { name: 'Lifetime', price: 14999, interval: 'lifetime', isActive: true }
    ];

    for (const plan of plans) {
        const planRef = db.collection('plans').doc();
        await planRef.set({
            id: planRef.id,
            ...plan,
            features: ['Unlimited Customers', 'WhatsApp Integration', 'SMS Reminders'],
            createdAt: new Date()
        });
        console.log(`✓ Plan created: ${plan.name}`);
    }

    console.log('\n🎉 Firestore seeded successfully!');
    console.log(`\nIMPORTANT: Make sure your JWT token contains vendorId: ${vendorId}`);
    console.log('If not, update the vendorId in this script to match your JWT token.\n');
}

seedFirestore()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exit(1);
    });
