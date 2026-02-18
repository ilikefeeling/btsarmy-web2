import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
    initializeFirestore,
    getFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';
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
const isNewApp = !getApps().length;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Explicitly set persistence to Local Storage to prevent session loss on refresh
import { setPersistence, browserLocalPersistence } from 'firebase/auth';
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Auth Persistence Error:", error);
});

// Modern Firestore Initialization with Persistent Cache
// experimentalForceLongPolling is kept for proxy environments
export const db = isNewApp
    ? initializeFirestore(app, {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    })
    : getFirestore(app);

export const storage = getStorage(app);
export { app };
export default app;

