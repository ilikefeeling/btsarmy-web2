'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserProfile } from '@/lib/db';
import { useEffect, useState } from 'react';
import {
    Users,
    Radio,
    ShoppingBag,
    Image as ImageIcon,
    HeartHandshake,
    LogOut,
    Menu,
    Book,
    ShieldAlert
} from 'lucide-react';
import NotificationDropdown from '@/components/layout/NotificationDropdown'; // Import added correctly


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, loading } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const [isAdmin, setIsAdmin] = useState(false);

    // Auth Guard
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Admin Check
    // Admin Check
    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            // 1. Check Service Number (Hardcoded Super Admin)
            if (user.email && user.email.startsWith('0000-0000')) {
                setIsAdmin(true);
                return;
            }

            // 2. Check Database Role
            try {
                const profile = await getUserProfile(user.uid);
                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("Failed to check admin status:", error);
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, [user]);
    // ...
    // ...
    // In SidebarContent
    <div className="p-2 md:p-6 md:border-b border-white/10 mb-4 md:mb-0">
        <h1 className="text-xl font-bold tracking-tighter text-bts-purple hidden md:block">
            ARMY <span className="text-white">COMMAND</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1 hidden md:block">
            Service Number: {user?.email ? user.email.split('@')[0] : '...'}
        </p>
    </div>

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl">
                <SidebarContent
                    t={t}
                    pathname={pathname}
                    user={user}
                    isAdmin={isAdmin}
                    language={language}
                    setLanguage={setLanguage}
                    handleLogout={handleLogout}
                />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="absolute left-0 top-0 h-full w-64 bg-black border-r border-white/10 p-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-bts-purple">MENU</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400">
                                <LogOut className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                        <SidebarContent
                            t={t}
                            pathname={pathname}
                            user={user}
                            isAdmin={isAdmin}
                            language={language}
                            setLanguage={setLanguage}
                            handleLogout={handleLogout}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                    <span className="font-bold text-bts-purple">ARMY COMMAND</span>
                    <div className="flex items-center gap-2">
                        <NotificationDropdown />
                        <button
                            className="p-2 text-gray-400 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Extracted Sidebar Content for reuse
function SidebarContent({ t, pathname, user, isAdmin, language, setLanguage, handleLogout }: any) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-2 md:p-6 md:border-b border-white/10 mb-4 md:mb-0">
                <h1 className="text-xl font-bold tracking-tighter text-bts-purple hidden md:block">
                    ARMY <span className="text-white">COMMAND</span>
                </h1>
                <p className="text-xs text-gray-400 mt-1 hidden md:block">
                    Service Number: {user?.email ? user.email.split('@')[0] : 'Loading...'}
                </p>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem
                    href="/dashboard"
                    icon={<Radio />}
                    label={t('sidebar.dashboard')}
                    active={pathname === '/dashboard'}
                />
                <NavItem
                    href="/dashboard/archive"
                    icon={<ImageIcon />}
                    label={t('sidebar.gallery')}
                    active={pathname.startsWith('/dashboard/archive')}
                />
                <NavItem
                    href="/dashboard/healing"
                    icon={<HeartHandshake />}
                    label={t('sidebar.healing')}
                    active={pathname.startsWith('/dashboard/healing')}
                />
                <NavItem
                    href="/dashboard/guide"
                    icon={<Book />}
                    label={t('sidebar.guide')}
                    active={pathname.startsWith('/dashboard/guide')}
                />

                {isAdmin && (
                    <>
                        <div className="my-2 border-t border-white/5"></div>
                        <NavItem
                            href="/admin"
                            icon={<ShieldAlert className="text-red-500" />}
                            label={t('sidebar.admin')}
                            active={pathname.startsWith('/admin')}
                            className="text-red-400 hover:bg-red-500/10"
                        />
                    </>
                )}
            </nav>

            <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
                {/* Language Switcher */}
                <div className="flex bg-white/5 rounded-lg p-1">
                    <button
                        onClick={() => setLanguage('ko')}
                        className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${language === 'ko' ? 'bg-bts-purple text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        KOR
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${language === 'en' ? 'bg-bts-purple text-white font-bold' : 'text-gray-400 hover:text-white'}`}
                    >
                        ENG
                    </button>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {t('auth.logout')}
                </button>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label, active = false, className }: { href: string; icon: React.ReactNode; label: string; active?: boolean, className?: string }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
                ? 'bg-bts-purple/20 text-bts-purple border border-bts-purple/20'
                : className || 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className="w-5 h-5">{icon}</span>
            {label}
        </Link>
    );
}
