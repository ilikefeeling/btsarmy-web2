'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, ShoppingCart, RefreshCw } from 'lucide-react';
import { getDailyHotTopics, type TrendTopic } from '@/lib/ai';

export default function TrendRadar() {
    const [trends, setTrends] = useState<TrendTopic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                const data = await getDailyHotTopics();
                setTrends(data);
            } catch (error) {
                console.error("Failed to fetch trends", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();

        // Auto-refresh every 30 seconds to simulate real-time updates
        const interval = setInterval(fetchTrends, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass-card rounded-xl p-6 h-full border border-white/5 bg-black/40">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-bts-purple" />
                    Trend Radar
                </h3>
                <button
                    onClick={() => setLoading(true)} // Simple trigger to show loading state
                    className={`p-2 rounded-full hover:bg-white/10 transition-colors ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            <div className="space-y-4">
                {trends.map((topic, index) => (
                    <div key={topic.keyword} className="group relative">
                        <div className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className={`text-sm font-bold w-4 ${index < 3 ? 'text-bts-purple' : 'text-gray-600'}`}>
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-200 text-sm">{topic.keyword}</p>
                                    <p className="text-[10px] text-gray-500">{topic.volume.toLocaleString()} mentions</p>
                                </div>
                            </div>

                            {/* Sentiment Indicator */}
                            <div className={`w-1.5 h-1.5 rounded-full ${topic.sentiment === 'positive' ? 'bg-green-500' :
                                    topic.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                        </div>

                        {/* Smart Commerce Injection */}
                        {topic.relatedProduct && (
                            <Link
                                href={topic.relatedProduct}
                                className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 bg-bts-purple text-white text-xs px-3 py-1.5 rounded-full items-center gap-1 shadow-lg animate-in fade-in zoom-in duration-200"
                            >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Shop Related</span>
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 text-center">
                <p className="text-xs text-gray-600">
                    AI-powered analysis based on global ARMY activity. <br />
                    Updates every 30s.
                </p>
            </div>
        </div>
    );
}
