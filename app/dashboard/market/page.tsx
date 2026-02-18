'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ShoppingBag,
    Plus,
    Search,
    Filter,
    SlidersHorizontal
} from 'lucide-react';
import { subscribeToMarket, MarketItem } from '@/lib/db';
import MarketCard from '@/components/market/MarketCard';

const CATEGORIES = ['All', 'Photocard', 'Album', 'Merch', 'Fashion', 'Other'];

export default function MarketPage() {
    const [items, setItems] = useState<MarketItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = subscribeToMarket((data) => {
            setItems(data);
            setFilteredItems(data);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let result = items;

        // Filter by Category
        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }

        // Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(lowerTerm) ||
                item.description.toLowerCase().includes(lowerTerm)
            );
        }

        setFilteredItems(result);
    }, [activeCategory, searchTerm, items]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6 sticky top-0 bg-black/80 backdrop-blur-xl z-30 pt-4 -mx-4 px-4 md:-mx-8 md:px-8">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-bts-purple animate-gradient">
                        PURPLE MARKET
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2">
                        Safe Transaction Zone. <span className="text-bts-purple font-bold">Verified Army Only.</span>
                    </p>
                </div>

                <Link href="/dashboard/market/new">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10">
                        <Plus className="w-5 h-5" />
                        Sell Item
                    </button>
                </Link>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search for photocards, albums, limited merch..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-bts-purple transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                    ? 'bg-bts-purple text-white shadow-lg shadow-bts-purple/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item Grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                    <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No items found</h3>
                    <p className="text-gray-500 mt-2">Be the first to list a collection on Purple Market!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map(item => (
                        <MarketCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );
}
