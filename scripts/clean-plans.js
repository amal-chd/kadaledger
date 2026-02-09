const admin = require('firebase-admin');
require('dotenv').config({ path: '../.env' });

if (!admin.apps.length) {
    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        };

        if (serviceAccount.privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else {
            console.log("No private key found, trying default app...");
            admin.initializeApp();
        }
    } catch (error) {
        console.error('Firebase Init Error:', error);
        process.exit(1);
    }
}

async function cleanPlans() {
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
            price: 199,
            interval: 'month',
            description: 'Perfect for growing businesses',
            features: ['Unlimited Customers', 'WhatsApp Reminders', 'Advanced Analytics'],
            isActive: true
        },
        {
            name: 'Yearly',
            price: 1999,
            interval: 'year',
            description: 'Best value for established businesses',
            features: ['All Monthly Features', 'Priority Support', '2 Months Free'],
            isActive: true
        },
        {
            name: 'Lifetime',
            price: 5999, // Updated based on screenshot active price
            interval: 'lifetime',
            description: 'One-time payment for lifetime access',
            features: ['All Future Updates', 'VIP Support', 'No Recurring Fees'],
            isActive: true
        }
    ];

    console.log('Fetching all existing plans...');
    const snapshot = await plansCollection.get();
    const allPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${allPlans.length} total plans.`);

    const processedIds = new Set();

    // 1. Process Targets (Deduplicate)
    for (const target of targetPlans) {
        // Find ALL matches by name
        const matches = allPlans.filter(p => p.name?.toLowerCase() === target.name.toLowerCase());

        if (matches.length > 0) {
            // Sort to find the "best" one to keep
            // Priority: Active > Recently Updated/Created > Price match
            matches.sort((a, b) => {
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                // If both active/inactive, pick one with matching price?
                if (a.price === target.price && b.price !== target.price) return -1;
                if (b.price === target.price && a.price !== target.price) return 1;
                return 0;
            });

            const keep = matches[0];
            console.log(`Keeping best match for ${target.name}: ${keep.id} (Status: ${keep.isActive ? 'Active' : 'Inactive'}, Price: ${keep.price})`);

            // Update the kept plan to match target exactly
            await plansCollection.doc(keep.id).set({
                ...target,
                updatedAt: new Date()
            }, { merge: true });

            processedIds.add(keep.id);

            // Delete duplicates
            for (let i = 1; i < matches.length; i++) {
                const dupe = matches[i];
                console.log(`Deleting duplicate ${target.name}: ${dupe.id}`);
                await plansCollection.doc(dupe.id).delete();
                processedIds.add(dupe.id);
            }

        } else {
            console.log(`Creating missing plan: ${target.name}`);
            const res = await plansCollection.add({
                ...target,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            processedIds.add(res.id);
        }
    }

    // 2. Delete Unknown Plans
    for (const plan of allPlans) {
        if (!processedIds.has(plan.id)) {
            console.log(`Deleting unknown/unused plan: ${plan.name} (${plan.id})`);
            await plansCollection.doc(plan.id).delete();
        }
    }

    console.log('Plan cleanup complete.');
}

cleanPlans()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
