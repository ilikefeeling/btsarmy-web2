'use client';

import { useEffect, useState, useCallback } from 'react';
import { getAllUsers, updateUserRank, UserProfile } from '@/lib/db';
import { Search } from 'lucide-react';
import Image from 'next/image';

export default function UserManagementPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getAllUsers().then(data => {
            setUsers(data);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRankUpdate = async (uid: string, currentRank: string) => {
        const nextRank = currentRank === 'Recruit' ? 'Soldier'
            : currentRank === 'Soldier' ? 'Commander'
                : 'Recruit'; // Cycle for demo simplicity

        if (confirm(`Promote user to ${nextRank}?`)) {
            await updateUserRank(uid, nextRank as any);
            fetchUsers(); // Refresh
        }
    };

    const filteredUsers = users.filter(user =>
        (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.serviceNumber || '').includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage personnel records and access levels.</p>
                </div>
                <button onClick={fetchUsers} className="text-xs text-red-400 hover:text-red-300 underline">
                    Refresh Data
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search by Alias or Service Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-red-500/50"
                />
            </div>

            {/* Table */}
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase">
                        <tr>
                            <th className="p-4">Personnel</th>
                            <th className="p-4">Service Number</th>
                            <th className="p-4">Rank</th>
                            <th className="p-4">Role</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading records...</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
                                        {user.photoURL ? (
                                            <Image src={user.photoURL} alt={user.displayName || 'u'} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                {(user.displayName || 'U')[0]}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-bold text-white">{user.displayName}</span>
                                </td>
                                <td className="p-4 font-mono text-sm text-gray-300">{user.serviceNumber}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                        ${user.rank === 'Commander' ? 'bg-yellow-500/20 text-yellow-500' :
                                            user.rank === 'Soldier' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-300'}`}>
                                        {user.rank}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs ${user.role === 'admin' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleRankUpdate(user.uid, user.rank)}
                                        className="text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors"
                                    >
                                        Adjust Rank
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
