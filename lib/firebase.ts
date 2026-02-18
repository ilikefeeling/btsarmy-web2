import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, CACHE_SIZE_UNLIMITED, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Explicitly set persistence to Local Storage to prevent session loss on refresh
// This is critical for environments where session cookies might be cleared or blocked
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth Persistence Error:", error);
});

// Use experimentalAutoDetectLongPolling to handle Vercel/CDN environments
// where WebSocket connections may be blocked or unstable.
// Only call initializeFirestore on first init; subsequent calls use getFirestore.
export const db = isNewApp
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    })
    : getFirestore(app);

// Enable Offline Persistence (Critical for LINE Browser / unstable networks)
if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('[Firebase] Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('[Firebase] The current browser does not support all of the features required to enable persistence');
        } else if (err.code === 'already-exists') {
            // Ignore if already enabled
        } else {
            console.warn('[Firebase] Persistence enable failed:', err);
        }
    });
}

export const storage = getStorage(app);
export { app };
export default app;

