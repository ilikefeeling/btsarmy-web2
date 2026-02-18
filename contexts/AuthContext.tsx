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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(false);

                // Background profile sync via API route
                // Wrapped in try-catch to ensure it never affects Auth State
                // This is where 'frame_ant.js' might cause AbortError, so we strictly isolate it.
                try {
                    if (currentUser.email && currentUser.email.endsWith('@army.bts')) {
                        const serviceNumber = currentUser.email.split('@')[0];
                        // If getIdToken fails due to connection, we just skip sync, we DON'T logout
                        const idToken = await currentUser.getIdToken().catch(e => {
                            console.warn('[Validation] Token fetch failed (likely network):', e);
                            return null;
                        });

                        if (idToken) {
                            fetch('/api/save-user', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${idToken}`,
                                },
                                body: JSON.stringify({ serviceNumber }),
                            }).catch(err => {
                                // Explicitly ignore AbortError/Network Error for sync
                                console.warn('[Validation] Background sync deferred:', err.name);
                            });
                        }
                    }
                } catch (error) {
                    console.warn('[Validation] Sync skipped due to error:', error);
                }
            } else {
                // User is null. 
                setUser(null);
                setLoading(false);
            }
        }, (error) => {
            // Error listener for onAuthStateChanged
            console.error('[Auth] Auth State Stream Error:', error);
            // If an error occurs in the stream (like AbortError on initial load),
            // we should try to keep the previous state if possible, or at least stop loading.
            if (error.message && (error.message.includes('network') || error.message.includes('abort'))) {
                console.warn('[Auth] Ignoring network error in auth stream.');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to convert Service Number to Email
    const formatEmail = (serviceNumber: string) => `${serviceNumber}@army.bts`;

    const loginWithServiceNumber = async (serviceNumber: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, formatEmail(serviceNumber), password);
        } catch (error) {
            console.error('Error signing in', error);
            throw error;
        }
    };

    const registerWithServiceNumber = async (serviceNumber: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, formatEmail(serviceNumber), password);
        } catch (error) {
            console.error('Error registering', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
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
