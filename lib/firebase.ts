import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
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

// Initialize Firebase (Singleton pattern)
// isNewApp: true means this is the first initialization, so we can call initializeFirestore
const isNewApp = !getApps().length;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use experimentalAutoDetectLongPolling to handle Vercel/CDN environments
// where WebSocket connections may be blocked or unstable.
// Only call initializeFirestore on first init; subsequent calls use getFirestore.
export const db = isNewApp
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    })
    : getFirestore(app);

export const storage = getStorage(app);
export { app };
export default app;

