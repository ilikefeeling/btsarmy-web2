'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, subscribeToNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NotificationDropdown() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = subscribeToNotifications(user.uid, (data) => {
            setNotifications(data);
        }, (error) => {
            // Ignore permission errors (initially might happen) and abort errors
            if (error.code === 'permission-denied' || error.name === 'AbortError') {
                return;
            }
            console.error("Notification error:", error);
        });
        return () => unsubscribe();
    }, [user]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllNotificationsAsRead(user.uid);
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!user || n.isRead) return;
        await markNotificationAsRead(user.uid, n.id);
        setIsOpen(false); // Close dropdown on click
    };

    const getNotificationText = (n: Notification) => {
        switch (n.type) {
            case 'like': return 'liked your post.';
            case 'comment': return 'commented on your post.';
            case 'reply': return 'replied to you.';
            case 'mention': return 'mentioned you.';
            default: return 'interacted with your post.';
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like': return '❤️';
            case 'reply': return '↩️';
            case 'mention': return '📢';
            default: return '💬';
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-bts-purple hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No new notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {notifications.map((n) => (
                                    <Link
                                        key={n.id}
                                        href={`/dashboard?highlight=${n.feedId}`}
                                        onClick={() => handleNotificationClick(n)}
                                        className={cn(
                                            "flex items-start gap-3 p-4 hover:bg-white/5 transition-colors",
                                            !n.isRead && "bg-bts-purple/5"
                                        )}
                                    >
                                        <div className="relative w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10">
                                            {n.fromUser.avatar ? (
                                                <Image src={n.fromUser.avatar} alt={n.fromUser.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                    {n.fromUser.name[0]}
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-black border border-black flex items-center justify-center">
                                                <span className="text-[10px]">
                                                    {getNotificationIcon(n.type)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-200">
                                                <span className="font-bold text-white">{n.fromUser.name}</span>
                                                {' '}
                                                {getNotificationText(n)}
                                            </p>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-bts-purple mt-2" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
