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
const USER_CACHE_KEY = 'army_user_cache';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Sticky Session: Keep track of the last user to restore if network flickers
    const lastKnownUser = useRef<User | null>(null);
    const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Hydrate from cache on mount (to handle reload + offline scenario)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);
            if (cachedUserStr) {
                try {
                    const cachedUser = JSON.parse(cachedUserStr);
                    // Minimal reconstruct to satisfy User interface for UI properties
                    lastKnownUser.current = cachedUser as User;
                    // We don't setUser immediately to allow onAuthStateChanged to take authoritative precedence,
                    // but we have it ready for the "Sad Path".
                } catch (e) {
                    console.error('Failed to parse user cache', e);
                }
            }
        }
    }, []);

    useEffect(() => {
        // Initial Check: If we expect a session, keep loading true
        const hasSessionMarker = typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY);
        if (hasSessionMarker) {
            setLoading(true);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Cancel any pending logout timer if a user is found
            if (logoutTimerRef.current) {
                clearTimeout(logoutTimerRef.current);
                logoutTimerRef.current = null;
            }

            if (currentUser) {
                // [Healthy State]
                // console.log('[Auth] Session Active/Restored');
                localStorage.setItem(SESSION_KEY, 'true');

                // Serializing user for cache (picking essential fields)
                // Note: deeply nested objects or methods won't survive, but email/uid will.
                const userForCache = {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    emailVerified: currentUser.emailVerified,
                    isAnonymous: currentUser.isAnonymous,
                    metadata: { ...currentUser.metadata },
                    providerData: [...currentUser.providerData],
                    // We can't cache methods like getIdToken, so we might need to handle that if used.
                };
                localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userForCache));

                lastKnownUser.current = currentUser; // Backup full object (including methods) in memory
                setUser(currentUser);
                setLoading(false);

                // Background profile sync (Isolated from Auth logic)
                try {
                    if (currentUser.email && currentUser.email.endsWith('@army.bts')) {
                        const serviceNumber = currentUser.email.split('@')[0];
                        // Resilient token fetch: ignore failures
                        currentUser.getIdToken().then(idToken => {
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
                        }).catch(() => { });
                    }
                } catch { /* Ignore Sync Errors */ }

            } else {
                // [Disconnected / Logout State]
                const shouldBeLoggedIn = localStorage.getItem(SESSION_KEY) === 'true';

                // Check if we have a stale user to restore (from memory ref OR local storage cache)
                if (shouldBeLoggedIn && lastKnownUser.current) {
                    // [Sticky Mode] Network drop or frame_ant.js abort detected
                    console.warn('[Auth] connection drop detected. Restoring sticky session...');

                    // CRITICAL: Restore the stale user object to prevent UI from redirecting to login
                    setUser(lastKnownUser.current);

                    // FORCE LOADING FALSE to ensure UI renders the Dashboard, not a spinner
                    // The user wants "Never Bounce", so we show the stale content.
                    setLoading(false);

                    // We do NOT set a logout timer. We hold ON indefinitely.
                } else {
                    // [Clean Logout]
                    setUser(null);
                    setLoading(false);
                    lastKnownUser.current = null;
                    localStorage.removeItem(USER_CACHE_KEY); // Clean up cache
                }
            }
        }, (error) => {
            console.error('[Auth] Stream Error:', error);
            // Safety: If stream errors, assume network issue and keep previous state
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
            // Explicit user intent: Remove markers FIRST
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(USER_CACHE_KEY);
            lastKnownUser.current = null; // Clear backup
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
