'use client';

import { useState } from 'react';
import {
    Heart,
    MessageCircle,
    Share2,
    Video,
    Image as ImageIcon,
    TrendingUp,
    Clock,
    Award,
    Upload,
    Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AdBanner from '@/components/ui/AdBanner';

// Types
interface FeedItem {
    id: string;
    type: 'video' | 'image';
    url: string; // Placeholder URL
    thumbnail?: string;
    author: {
        name: string;
        rank: string;
        avatar: string;
        country: string;
    };
    content: string;
    tags: string[];
    stats: {
        likes: number; // Borahae count
        comments: number;
        shares: number;
    };
    isOfficialArmyLog: boolean;
    timestamp: string;
}

// Mock Data
const MOCK_FEED: FeedItem[] = [
    {
        id: '1',
        type: 'video',
        url: '/mock-video.mp4',
        thumbnail: 'bg-purple-900',
        author: { name: 'Jungkook_Wife_97', rank: 'Commander', avatar: 'JK', country: 'KR' },
        content: 'My 7 seconds of happiness from the layout tour! 💜 #BTS #ArmyLog',
        tags: ['ArmyLog', 'Concert'],
        stats: { likes: 1204, comments: 450, shares: 89 },
        isOfficialArmyLog: true,
        timestamp: '10m ago'
    },
    {
        id: '2',
        type: 'image',
        url: '/mock-image.jpg',
        thumbnail: 'bg-blue-900',
        author: { name: 'TaeTae_Bear', rank: 'Soldier', avatar: 'V', country: 'US' },
        content: 'Look at this photo card pull!! I am shaking...',
        tags: ['Photocard', 'Luck'],
        stats: { likes: 89, comments: 12, shares: 2 },
        isOfficialArmyLog: false,
        timestamp: '32m ago'
    },
    {
        id: '3',
        type: 'video',
        url: '/mock-video-2.mp4',
        thumbnail: 'bg-pink-900',
        author: { name: 'Hobi_Sunshine', rank: 'Recruit', avatar: 'JH', country: 'BR' },
        content: 'Dance cover practice - 7s focused cam 🕺',
        tags: ['Dance', 'Cover'],
        stats: { likes: 567, comments: 88, shares: 30 },
        isOfficialArmyLog: true,
        timestamp: '1h ago'
    },
];

export default function GlobalLoungePage() {
    const [activeTab, setActiveTab] = useState<'HOT' | 'RISING' | 'NEW'>('HOT');
    const [isUploading, setIsUploading] = useState(false);

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header & Identity */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bts-purple via-white to-bts-purple animate-gradient">
                        GLOBAL LOUNGE
                    </h1>
                    <p className="text-gray-400 mt-2 flex items-center gap-2">
                        The Purple Carpet. <span className="text-bts-purple font-bold">7 Seconds of Magic.</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsUploading(!isUploading)}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-white/10"
                    >
                        <Upload className="w-5 h-5" />
                        Upload Content
                    </button>
                </div>
            </div>

            {/* Upload Area (Expandable) */}
            {isUploading && (
                <div className="glass-card p-6 rounded-2xl border border-bts-purple/30 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center h-64 bg-black/20 hover:border-bts-purple hover:bg-bts-purple/5 transition-colors cursor-pointer group">
                            <Video className="w-12 h-12 text-gray-500 group-hover:text-bts-purple mb-4 transition-colors" />
                            <p className="font-bold text-gray-300">Upload Video (Max 7s)</p>
                            <p className="text-xs text-gray-500 mt-2">MP4, WEBM supported. Auto-watermark applied.</p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-yellow-500" />
                                Creative Tools
                            </h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-bts-purple focus:ring-bts-purple" defaultChecked />
                                    Add "Army Log" Authenticity Tag
                                </label>
                                <label className="flex items-center gap-2 text-sm text-gray-300">
                                    <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-bts-purple focus:ring-bts-purple" defaultChecked />
                                    Apply official watermark
                                </label>
                            </div>
                            <textarea
                                placeholder="Describe your 7 seconds of magic... #BTS #ArmyLog"
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-bts-purple"
                            />
                            <button className="w-full py-3 bg-bts-purple text-white font-bold rounded-lg hover:bg-bts-purple-dark transition-colors">
                                Post to The Purple Carpet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ranking Tabs (The Purple Wave) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <TabButton
                    active={activeTab === 'HOT'}
                    onClick={() => setActiveTab('HOT')}
                    icon={<TrendingUp className="w-4 h-4" />}
                    label="HOT 50 (Global)"
                />
                <TabButton
                    active={activeTab === 'RISING'}
                    onClick={() => setActiveTab('RISING')}
                    icon={<Award className="w-4 h-4" />}
                    label="Rising Rookies"
                />
                <TabButton
                    active={activeTab === 'NEW'}
                    onClick={() => setActiveTab('NEW')}
                    icon={<Clock className="w-4 h-4" />}
                    label="Fresh Uploads"
                />
            </div>

            {/* Main Feed Grid (Pinterest Style) */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {MOCK_FEED.map((story) => (
                    <div key={story.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-bts-purple/50 transition-all duration-300">
                        {/* Media Placeholder */}
                        <div className={`aspect-[9/16] ${story.thumbnail} relative`}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <Play className="w-12 h-12 text-white fill-current drop-shadow-lg" />
                            </div>
                            {/* 7s Indicator */}
                            {story.type === 'video' && (
                                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white border border-white/20">
                                    0:07 / LOOP
                                </div>
                            )}
                            {/* Army Log Tag */}
                            {story.isOfficialArmyLog && (
                                <div className="absolute top-3 left-3 px-2 py-0.5 bg-bts-purple/90 rounded text-[10px] font-bold text-white shadow-lg shadow-bts-purple/40">
                                    ARMY LOG OFFICIAL
                                </div>
                            )}
                        </div>

                        {/* Info Overlay (Always visible on mobile, hover on desktop?) -> Let's make it bottom card style */}
                        <div className="p-4 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                        {story.author.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none">{story.author.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{story.author.rank} • {story.author.country}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 mb-4 line-clamp-2">{story.content}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-bts-purple transition-colors group/btn">
                                    <Heart className="w-4 h-4 group-hover/btn:fill-current transition-colors" />
                                    <span className="text-xs font-medium">{story.stats.likes}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">{story.stats.comments}</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">{story.stats.shares}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Ad In-Feed */}
                <div className="break-inside-avoid rounded-2xl overflow-hidden border border-white/5 bg-black/20 min-h-[200px] flex items-center justify-center">
                    <AdBanner dataAdSlot="feed-native" className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                active
                    ? "bg-bts-purple text-white shadow-lg shadow-bts-purple/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
