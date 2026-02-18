'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/db';
import Link from 'next/link';
import { Users, ShieldAlert, LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!loading) {
                if (!user) {
                    router.push('/');
                    return;
                }

                const profile = await getUserProfile(user.uid);
                if (profile?.role !== 'admin') {
                    alert('Access Denied. Admin permissions required.');
                    router.push('/dashboard');
                } else {
                    setIsAdmin(true);
                }
                setCheckingRole(false);
            }
        };

        checkAdmin();
    }, [user, loading, router]);

    if (loading || checkingRole) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-bts-purple">
                Loading Admin Protocol...
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-red-950/20 border-r border-red-500/20 flex flex-col">
                <div className="p-6 border-b border-red-500/20">
                    <h1 className="text-2xl font-black text-red-500 tracking-tighter flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" />
                        ADMIN
                    </h1>
                    <p className="text-xs text-red-400/60 mt-1">Security Level: MAXIMUM</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-red-100 hover:bg-red-500/10 rounded-lg transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Overview
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-red-100 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        User Management
                    </Link>
                </nav>

                <div className="p-4 border-t border-red-500/20">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors text-sm">
                        <LogOut className="w-4 h-4" />
                        Exit to Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 relative">
                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] z-50 bg-[length:100%_4px,6px_100%] opacity-20"></div>
                {children}
            </main>
        </div>
    );
}
