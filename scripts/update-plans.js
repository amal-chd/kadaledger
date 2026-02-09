const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed, assuming running from web/scripts

if (!admin.apps.length) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        };

        if (!serviceAccount.privateKey) {
            console.error('FIREBASE_PRIVATE_KEY is missing in .env');
            process.exit(1);
        }

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin Initialized');
    } catch (error) {
        console.error('Firebase Init Error:', error);
        process.exit(1);
    }
}

async function updatePlans() {
    const db = admin.firestore();
    const plansCollection = db.collection('plans');

    const targetPlans = [
        {
            name: 'Free',
            price: 0,
            interval: 'month',
            description: 'Essential features for small businesses',
            features: ['Up to 50 Customers', 'Basic Reports', 'Mobile App Access'],
            isActive: true
        },
        {
            name: 'Monthly',
            price: 199, // Adjust pricing as per previous context or standard
            interval: 'month',
            description: 'Perfect for growing businesses',
            features: ['Unlimited Customers', 'WhatsApp Reminders', 'Advanced Analytics'],
            isActive: true
        },
        {
            name: 'Yearly',
            price: 1999, // ~2 months free
            interval: 'year',
            description: 'Best value for established businesses',
            features: ['All Monthly Features', 'Priority Support', '2 Months Free'],
            isActive: true
        },
        {
            name: 'Lifetime',
            price: 4999,
            interval: 'lifetime',
            description: 'One-time payment for lifetime access',
            features: ['All Future Updates', 'VIP Support', 'No Recurring Fees'],
            isActive: true
        }
    ];

    console.log('Fetching existing plans...');
    const snapshot = await plansCollection.get();
    const existingPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 1. Upsert Target Plans
    for (const target of targetPlans) {
        // Find match by name (case insensitive)
        const match = existingPlans.find(p => p.name.toLowerCase() === target.name.toLowerCase());

        if (match) {
            console.log(`Updating existing plan: ${target.name} (${match.id})`);
            await plansCollection.doc(match.id).update(target);
            // Mark as processed so we don't deactivate it later
            match._processed = true;
        } else {
            console.log(`Creating new plan: ${target.name}`);
            await plansCollection.add({
                ...target,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
    }

    // 2. Deactivate others
    for (const plan of existingPlans) {
        // If it was matched above, it has _processed = true (in our local object, need to track logic carefully)
        // Wait, the 'match' object in the loop above is a reference to the object in existingPlans array. 
        // So modifying match._processed works.

        if (!plan._processed) {
            console.log(`Deactivating unused plan: ${plan.name} (${plan.id})`);
            await plansCollection.doc(plan.id).update({ isActive: false });
        }
    }

    console.log('Plans update complete.');
}

updatePlans()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
