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

async function listPlans() {
    const db = admin.firestore();
    console.log(`Connected to Project: ${process.env.FIREBASE_PROJECT_ID}`);
    const snapshot = await db.collection('plans').get();

    console.log(`Total Documents: ${snapshot.size}`);
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`[${doc.id}] Name: "${data.name}", Price: ${data.price}, Interval: ${data.interval}, Active: ${data.isActive}`);
    });
}

listPlans()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
