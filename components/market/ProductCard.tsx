'use client';

import Image from 'next/image';
import { Heart, ShieldCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
    id: string;
    title: string;
    price: number;
    image: string;
    seller: {
        name: string;
        rank: string;
        verified: boolean;
        rating: number;
    };
    category: string;
}

export default function ProductCard({ product }: { product: ProductCardProps }) {
    const { title, price, image, seller } = product;

    return (
        <div className="group relative bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-bts-purple/50 hover:shadow-lg hover:shadow-bts-purple/20 transition-all duration-300">
            {/* Image Area */}
            <div className="aspect-square relative overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                {/* Placeholder for actual image */}
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                    {/* <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /> */}
                    <span className="text-xs">Product Image</span>
                </div>

                <button className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-red-400 hover:bg-black/60 transition-colors z-20">
                    <Heart className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="px-2 py-1 rounded-md bg-bts-purple text-white text-xs font-bold shadow-md">
                        View Details
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-100 line-clamp-1 group-hover:text-bts-purple transition-colors">{title}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className={cn(
                        "flex items-center gap-1 px-1.5 py-0.5 rounded",
                        seller.verified ? "bg-blue-500/20 text-blue-300" : "bg-gray-700 text-gray-400"
                    )}>
                        {seller.verified && <ShieldCheck className="w-3 h-3" />}
                        {seller.name}
                    </span>
                    <span className="flex items-center gap-0.5 text-yellow-500/80">
                        <Star className="w-3 h-3 fill-yellow-500/80" />
                        {seller.rating}
                    </span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                    <span className="text-lg font-bold text-white">₩{price.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                        {seller.rank}
                    </span>
                </div>
            </div>
        </div>
    );
}
