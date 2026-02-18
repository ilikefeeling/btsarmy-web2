'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, UserProfile, subscribeToFeed, deleteFeedItem, FeedItem } from '@/lib/db';
import { Users, UserPlus, AlertTriangle, ShieldCheck, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);

    useEffect(() => {
        // Fetch stats (mocking stats by fetching all users for now)
        getAllUsers().then(data => {
            setUsers(data);
        });
    }, []);

    const commanders = users.filter(u => u.rank === 'Commander').length;
    const soldiers = users.filter(u => u.rank === 'Soldier').length;
    const recruits = users.filter(u => u.rank === 'Recruit').length;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white mb-6">System Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Agents"
                    value={users.length}
                    icon={<Users className="text-blue-400" />}
                    color="border-blue-500/30 bg-blue-500/10"
                />
                <StatCard
                    title="Commanders"
                    value={commanders}
                    icon={<ShieldCheck className="text-yellow-400" />}
                    color="border-yellow-500/30 bg-yellow-500/10"
                />
                <StatCard
                    title="Active Soldiers"
                    value={soldiers}
                    icon={<ShieldCheck className="text-purple-400" />}
                    color="border-purple-500/30 bg-purple-500/10"
                />
                <StatCard
                    title="New Recruits"
                    value={recruits}
                    icon={<UserPlus className="text-green-400" />}
                    color="border-green-500/30 bg-green-500/10"
                />
            </div>

            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Security Alerts
                </h2>
                <div className="bg-red-950/10 border border-red-500/20 rounded-lg p-6 text-red-400 text-sm font-mono">
                    No active threats detected. System operating at 100% integrity.
                </div>
            </div>

            {/* Content Management Section */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-bts-purple" />
                    Global Feed Management
                </h2>
                <FeedManagement />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    return (
        <div className={`p-6 rounded-xl border ${color} backdrop-blur-sm`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-black text-white mt-2">{value}</h3>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    )
}

function FeedManagement() {
    const [feed, setFeed] = useState<FeedItem[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToFeed((items) => {
            setFeed(items);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Permanently delete this post? This action cannot be undone.')) {
            await deleteFeedItem(id);
        }
    };

    return (
        <div className="bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-white/5 text-gray-200 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Content</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Stats</th>
                            <th className="p-4">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {feed.map((item) => (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-black overflow-hidden relative border border-white/10 flex-shrink-0">
                                            {item.url ? (
                                                item.type === 'video' ? (
                                                    <video src={item.url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Image src={item.url} alt="thumb" fill className="object-cover" />
                                                )
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">Text</div>
                                            )}
                                        </div>
                                        <div className="max-w-xs">
                                            <p className="text-white font-medium line-clamp-1">{item.content}</p>
                                            {item.externalLink && (
                                                <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                                                    <ExternalLink className="w-3 h-3" /> Link
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden relative">
                                            {item.author.avatar ? (
                                                <Image src={item.author.avatar} alt={item.author.name} fill />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px]">{item.author.name[0]}</div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white text-xs">{item.author.name}</p>
                                            <p className="text-[10px] text-gray-500">{item.author.rank}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-xs">
                                    <div className="flex gap-2">
                                        <span>❤️ {item.stats.likes}</span>
                                        <span>💬 {item.stats.comments}</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-lg transition-colors"
                                        title="Delete Post"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {feed.length === 0 && (
                <div className="p-8 text-center text-gray-500">No active reports or posts found.</div>
            )}
        </div>
    );
}
