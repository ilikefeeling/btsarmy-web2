'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addMarketItem, getUserProfile, UserProfile } from '@/lib/db';
import { Upload, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = ['Photocard', 'Album', 'Merch', 'Fashion', 'Other'];

export default function NewMarketItemPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then(setUserProfile);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userProfile) return;

        setIsSubmitting(true);
        try {
            // Mock image for now
            const mockImages = [`https://picsum.photos/seed/${Date.now()}/500/500`];

            await addMarketItem(
                userProfile,
                title,
                Number(price),
                description,
                category as any,
                mockImages
            );
            router.push('/dashboard/market');
        } catch (error) {
            console.error("Failed to list item", error);
            alert("Failed to list item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <Link href="/dashboard/market" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ChevronLeft className="w-5 h-5" />
                Back to Market
            </Link>

            <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h1 className="text-2xl font-black text-white mb-2">Sell Item</h1>
                <p className="text-gray-400 text-sm mb-8">List your item on the secure Purple Market.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload Placeholder */}
                    <div className="w-full h-48 border-2 border-dashed border-gray-700 hover:border-bts-purple rounded-xl flex flex-col items-center justify-center bg-black/20 cursor-pointer transition-colors group">
                        <Upload className="w-10 h-10 text-gray-500 group-hover:text-bts-purple mb-3 transition-colors" />
                        <span className="text-sm font-bold text-gray-400 group-hover:text-white">Click to upload photos</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                            <input
                                required
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bts-purple"
                                placeholder="e.g. BTS Proof Standard Edition (Unsealed)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price (KRW)</label>
                                <input
                                    required
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bts-purple"
                                    placeholder="50000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bts-purple appearance-none"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full h-32 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-bts-purple resize-none"
                                placeholder="Describe the condition, inclusions, and shipping method..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-bts-purple text-white font-bold rounded-xl hover:bg-bts-purple-dark transition-colors shadow-lg shadow-bts-purple/20 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'List Item Now'}
                    </button>
                </form>
            </div>
        </div>
    );
}
