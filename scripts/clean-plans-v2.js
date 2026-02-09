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

async function forceCleanPlans() {
    const db = admin.firestore();
    const plansCollection = db.collection('plans');

    // IDs identified from debug-plans.js that need to be removed (The all-caps ones)
    // We want to keep the auto-generated ID ones which have the correct Title Case names
    const idsToDelete = [
        'FREE',
        'MONTHLY',
        'YEARLY',
        'LIFETIME'
    ];

    console.log('Force cleaning specific plan IDs...');

    for (const id of idsToDelete) {
        const doc = await plansCollection.doc(id).get();
        if (doc.exists) {
            console.log(`Deleting plan with ID: ${id} (Name: ${doc.data().name})`);
            await plansCollection.doc(id).delete();
            console.log(`Verified deletion of ${id}`);
        } else {
            console.log(`Plan with ID ${id} not found (already deleted?)`);
        }
    }

    // Now verification pass to ensure we have the correct 4
    console.log('Verifying remaining plans...');
    const snapshot = await plansCollection.get();
    const remaining = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`Remaining Plans (${remaining.length}):`);
    remaining.forEach(p => console.log(`- ${p.name} (${p.id}) [${p.isActive ? 'Active' : 'Inactive'}]`));

    if (remaining.length !== 4) {
        console.log('WARNING: Still not 4 plans. You might need to check for other duplicates.');
    } else {
        console.log('SUCCESS: Exactly 4 plans remain.');
    }
}

forceCleanPlans()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
