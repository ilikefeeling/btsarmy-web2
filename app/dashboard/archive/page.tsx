import { Image as ImageIcon, Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // Fixed import

export default function ArchivePage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Archive 7</h1>
                    <p className="text-gray-400">Golden History. Fan Arts. Theories.</p>
                </div>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                    Upload Content
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Mock Gallery Grid */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-900 border border-white/5 cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                        {/* Text Content */}
                        <div className="absolute bottom-0 left-0 p-4 w-full">
                            <h3 className="text-white font-bold text-sm truncate">Memories of 202{item}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-400">By Army_{item}</span>
                                <span className="flex items-center gap-1 text-xs text-bts-purple">
                                    <Heart className="w-3 h-3 fill-current" /> {item * 143}
                                </span>
                            </div>
                        </div>

                        {/* Center Icon (Placeholder for Image) */}
                        <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-gray-700 group-hover:text-white transition-colors" />
                    </div>
                ))}
            </div>
        </div>
    );
}
