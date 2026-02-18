import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Debug: Check if config is loaded
if (typeof window !== 'undefined') {
    console.error("Firebase Config Debug (Please Check):", {
        apiKey: firebaseConfig.apiKey ? "Present" : "MISSING",
        authDomain: firebaseConfig.authDomain ? "Present" : "MISSING",
        projectId: firebaseConfig.projectId ? "Present" : "MISSING",
        storageBucket: firebaseConfig.storageBucket ? "Present" : "MISSING",
        appId: firebaseConfig.appId ? "Present" : "MISSING",
    });
}

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
// Initialize Firestore with settings for offline persistence and long-polling
// This fixes "client is offline" issues in restrictive networks (e.g. corporate firewalls, in-app browsers)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Force long-polling to bypass proxy/firewall issues
});
export const storage = getStorage(app);
export { app };
export default app;
