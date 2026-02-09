const admin = require('firebase-admin');
require('dotenv').config();

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
        });
        console.log('Firebase Admin Initialized for project:', process.env.FIREBASE_PROJECT_ID);
    } catch (error) {
        console.error('Init Error:', error);
    }
}

async function test() {
    try {
        const db = admin.firestore();
        console.log('Attempting to write to test/doc...');
        await db.collection('test').doc('doc').set({ timestamp: new Date() });
        console.log('Write successful!');

        const doc = await db.collection('test').doc('doc').get();
        console.log('Read successful:', doc.data());
    } catch (e) {
        console.error('Test Failed:', e);
    }
}

test();
