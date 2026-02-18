'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setLoading(false);

            if (user) {
                // Background profile sync - non-blocking
                // Dynamically import to avoid circular dependencies
                import('@/lib/db').then(async ({ saveUser }) => {
                    try {
                        // Check if user has a valid service number email format
                        if (user.email && user.email.endsWith('@army.bts')) {
                            const serviceNumber = user.email.split('@')[0];
                            await saveUser(user, serviceNumber);
                        }
                    } catch (error) {
                        console.error("Failed to save user profile in background:", error);
                    }
                });
            }
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
