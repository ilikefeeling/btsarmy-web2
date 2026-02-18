'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserPosts, UserProfile, FeedItem } from '@/lib/db';
import { Loader2, MapPin, Award, Calendar, ExternalLink, Play } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists

export default function ProfilePage() {
    const params = useParams();
    const uid = params.uid as string;
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!uid) return;

        const fetchData = async () => {
            try {
                const [profileData, postsData] = await Promise.all([
                    getUserProfile(uid),
                    getUserPosts(uid)
                ]);
                setProfile(profileData);
                setPosts(postsData);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uid]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-bts-purple" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex h-96 items-center justify-center text-gray-500">
                User not found.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Profile Header Container */}
            <div className="relative">
                {/* Banner (Abstract Gradient) */}
                <div className="h-48 w-full bg-gradient-to-r from-bts-purple/20 via-purple-900/40 to-black rounded-3xl border border-white/5 overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                </div>

                {/* Profile Info Overlay */}
                <div className="px-8 pb-8 -mt-20 flex flex-col md:flex-row items-end gap-6">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black bg-gray-800 shadow-2xl overflow-hidden shrink-0">
                        {profile.photoURL ? (
                            <Image
                                src={profile.photoURL}
                                alt={profile.displayName || 'User'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                                {profile.displayName?.[0] || '?'}
                            </div>
                        )}
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 space-y-2 mb-2 text-center md:text-left">
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {profile.displayName}
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                <Award className="w-4 h-4 text-bts-purple" />
                                {profile.rank}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" />
                                {profile.country}
                            </span>
                            <span className="flex items-center gap-1.5 font-mono text-gray-500">
                                #{profile.serviceNumber || 'UNKNOWN'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    {currentUser?.uid === uid && (
                        <button className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors mb-2 shadow-lg">
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Activity Feed (Grid) */}
            <div className="space-y-6">
                <div className="flex items-center gap-4 px-4 border-b border-white/10 pb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        Activity Logs
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            ({posts.length})
                        </span>
                    </h2>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No activity logs recorded yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {posts.map((post) => (
                            <div key={post.id} className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-white/5 group hover:border-bts-purple/50 transition-all cursor-pointer">
                                {post.url || post.externalLink ? (
                                    <>
                                        {(post.type === 'video' || (post.externalLink && getYouTubeThumbnail(post.externalLink))) ? (
                                            <div className="w-full h-full relative">
                                                <Image
                                                    src={getYouTubeThumbnail(post.externalLink || '') || post.thumbnail || post.url || ''}
                                                    alt="content"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <Play className="w-8 h-8 text-white opacity-80" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full relative">
                                                <Image
                                                    src={post.url || getYouTubeThumbnail(post.externalLink || '') || ''}
                                                    alt="content"
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gray-800">
                                        <p className="text-xs text-gray-400 line-clamp-4 leading-relaxed">
                                            {post.content}
                                        </p>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <div className="flex gap-4 text-xs font-bold text-white">
                                        <span>♥ {post.stats.likes}</span>
                                        <span>💬 {post.stats.comments}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
// Helper to parse youtube thumb again if not imported
function getYouTubeThumbnail(url: string) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`
        : null;
}
