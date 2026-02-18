import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import { MarketItem } from '@/lib/db';

interface MarketCardProps {
    item: MarketItem;
}

export default function MarketCard({ item }: MarketCardProps) {
    return (
        <div className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden hover:border-bts-purple/50 transition-all duration-300">
            {/* Image Area */}
            <div className="aspect-square relative bg-gray-900 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                    <Image
                        src={item.images[0]}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">No Image</div>
                )}

                {/* Status Badge */}
                {item.status !== 'selling' && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur rounded-full text-xs font-bold text-white border border-white/10 uppercase">
                        {item.status}
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-bts-purple/90 rounded text-[10px] font-bold text-white shadow-lg">
                    {item.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-white font-bold truncate mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                    {item.seller.alias} ({item.seller.rank})
                </p>

                <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-white">
                        ₩ {item.price.toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-bts-purple transition-colors">
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <button className="w-full mt-3 py-2 bg-white/5 hover:bg-bts-purple text-gray-300 hover:text-white text-sm font-bold rounded-lg transition-colors border border-white/5">
                    Chat to Buy
                </button>
            </div>
        </div>
    );
}
