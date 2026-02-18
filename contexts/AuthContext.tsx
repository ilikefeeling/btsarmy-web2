'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithServiceNumber: (serviceNumber: string, password: string) => Promise<void>;
    registerWithServiceNumber: (serviceNumber: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const SESSION_KEY = 'army_session_active';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    // Ref to hold the timeout ID for debounce
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initial Check: If we expect a session, keep loading true
        const hasSessionMarker = typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY);
        if (hasSessionMarker) {
            setLoading(true);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Clear any pending logout timer if a user is found
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
                logoutTimerRef.current = null;
            }

            if (currentUser) {
                // Happy Path: User is logged in
                // 1. Mark session as active in LocalStorage
                localStorage.setItem(SESSION_KEY, 'true');

                setUser(currentUser);
                setLoading(false);

                // Background profile sync (Isolated from Auth logic)
                try {
                    if (currentUser.email && currentUser.email.endsWith('@army.bts')) {
                        const serviceNumber = currentUser.email.split('@')[0];
                        // Resilient token fetch
                        const idToken = await currentUser.getIdToken().catch(() => null);

                        if (idToken) {
                            fetch('/api/save-user', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ serviceNumber }),
                            }).catch(err => console.warn('[Validation] Sync postponed:', err.name));
                        }
                    }
                } catch { /* Ignore Sync Errors */ }
            } else {
                // Sad Path: User is null (Logout or Session Lost)
                // Check if we *should* be logged in
                const shouldBeLoggedIn = localStorage.getItem(SESSION_KEY) === 'true';

                if (shouldBeLoggedIn) {
                    // Suspicious Logout (likely Network Abort / frame_ant.js)
                    console.warn('[Auth] Session lost but LocalStorage says active. delaying logout...');

                    // Do NOT set user to null immediately.
                    // Wait 3 seconds to see if it recovers (or if it's a real logout, we force it)
                    // In a real app with 'onAuthStateChanged', it usually doesn't "flicker" null unless it's a real signout or token expiry.
                    // BUT, if the network is aborted during token refresh, it might emit null.

                    // If we are really paranoid, we just KEEP the old user if we have one? 
                    // No, we can't keep a stale user object that might be invalid.

                    // Compromise: Set 'loading' to true to show spinner instead of Login Screen.
                    setLoading(true);

                    // Set a timeout to accept the logout if it persists
                    logoutTimerRef.current = setTimeout(() => {
                        console.warn('[Auth] Session recovery failed. Logging out.');
                        localStorage.removeItem(SESSION_KEY);
                        setUser(null);
                        setLoading(false);
                    }, 5000); // 5 second grace period

                } else {
                    // Intentional Logout or Initial Load without session
                    setUser(null);
                    setLoading(false);
                }
            }
        }, (error) => {
            console.error('[Auth] Stream Error:', error);
            // Safety: If stream errors, assume network issue and keep previous state if possible
            // Do nothing to 'user' or 'loading' if we can avoid it.
        });

        return () => {
            unsubscribe();
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        };
    }, []);

    const formatEmail = (serviceNumber: string) => `${serviceNumber}@army.bts`;

    const loginWithServiceNumber = async (serviceNumber: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, formatEmail(serviceNumber), password);
            localStorage.setItem(SESSION_KEY, 'true'); // Set marker immediately
        } catch (error) {
            console.error('Error signing in', error);
            throw error;
        }
    };

    const registerWithServiceNumber = async (serviceNumber: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, formatEmail(serviceNumber), password);
            localStorage.setItem(SESSION_KEY, 'true'); // Set marker immediately
        } catch (error) {
            console.error('Error registering', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Explicit user intent: Remove marker FIRST
            localStorage.removeItem(SESSION_KEY);
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

            await signOut(auth);
            // State update will happen in onAuthStateChanged
        } catch (error) {
            console.error('Error signing out', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithServiceNumber, registerWithServiceNumber, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
