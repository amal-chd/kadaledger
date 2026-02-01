import "server-only";
import admin from 'firebase-admin';

// Check if app is already initialized
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Replace newlines in private key which might be escaped in env vars
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
            console.log('Firebase Admin Initialized');
        } else {
            console.warn('Firebase Admin: Missing environment variables. Skipping initialization.');
        }
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

export const firebaseAdmin = admin;
