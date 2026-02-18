import { HeartHandshake, Sparkles, User } from 'lucide-react';

export default function MagicShopPage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="text-center space-y-4 py-8">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-purple-300 animate-pulse">
                    Magic Shop
                </h1>
                <p className="text-gray-300 max-w-lg mx-auto leading-relaxed">
                    "On days I hate being myself, on days I want to disappear forever...
                    Let's make a door. It's in your heart."
                </p>
            </div>

            <div className="grid gap-6">
                {/* Write Post Box */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl shadow-purple-900/10">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <textarea
                                placeholder="What's weighing on your heart today? Anonymous posts allowed."
                                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none h-24 text-lg"
                            />
                            <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                                <div className="flex gap-2">
                                    <button className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">Anonymous</button>
                                    <button className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 transition-colors">Spoiler</button>
                                </div>
                                <button className="px-6 py-2 bg-bts-purple hover:bg-bts-purple-dark text-white rounded-full font-medium shadow-lg shadow-bts-purple/20 transition-all flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Open Door
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                    <PostCard
                        content="I've been feeling really stressed about exams lately, but listening to Zero O'Clock really helped me calm down. Keep going everyone! 💜"
                        author="Anonymous"
                        likes={234}
                        comments={12}
                    />
                    <PostCard
                        content="Just wanted to say that you are all loved. If you're having a hard time, remember that it passes."
                        author="HopeWorld_94"
                        likes={567}
                        comments={45}
                    />
                </div>
            </div>
        </div>
    );
}

function PostCard({ content, author, likes, comments }: { content: string; author: string; likes: number; comments: number }) {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-bold text-gray-400">{author}</span>
                <button className="text-xs text-gray-600 hover:text-red-400">Report</button>
            </div>
            <p className="text-gray-200 mb-4 leading-relaxed whitespace-pre-wrap">{content}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
                <button className="flex items-center gap-2 hover:text-bts-purple transition-colors">
                    <HeartHandshake className="w-4 h-4" /> {likes} Comforts
                </button>
                <button className="hover:text-white transition-colors">
                    {comments} Replies
                </button>
            </div>
        </div>
    );
}
