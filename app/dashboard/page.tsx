'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link
import {
    Heart,
    MessageCircle,
    Share2,
    Video,
    TrendingUp,
    Clock,
    Award,
    Upload,
    Play,
    ExternalLink,
    Music,
    BarChart3,
    AlertTriangle,
    ChevronRight,
    Globe,
    Trash2
} from 'lucide-react';
import { cn, getYouTubeThumbnail } from '@/lib/utils'; // Import helper
import AdBanner from '@/components/ui/AdBanner';
import ServiceGate from '@/components/ServiceGate';
import CommentSection from '@/components/dashboard/CommentSection'; // Import
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscribeToFeed, addFeedItem, deleteFeedItem, toggleLike, FeedItem, getUserProfile, UserProfile } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/Skeleton';

import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression'; // Import compression library

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedError, setFeedError] = useState(false);
    const [activeTab, setActiveTab] = useState<'HOT' | 'RISING' | 'NEW'>('HOT');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadContent, setUploadContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [externalLink, setExternalLink] = useState(''); // New State for Link
    const [translatedContent, setTranslatedContent] = useState<{ [key: string]: string }>({});
    const [translatingId, setTranslatingId] = useState<string | null>(null);
    const [openCommentsId, setOpenCommentsId] = useState<string | null>(null); // State for comments

    // File Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch User Profile
    useEffect(() => {
        if (user) {
            getUserProfile(user.uid).then(setUserProfile);
        }
    }, [user]);

    // Check for YouTube Link and set Preview
    useEffect(() => {
        if (externalLink) {
            const ytThumb = getYouTubeThumbnail(externalLink);
            if (ytThumb) {
                setPreviewUrl(ytThumb);
            } else if (!selectedFile) {
                // Only clear if no file is selected to avoid clearing file preview
                setPreviewUrl(null);
            }
        } else if (!selectedFile) {
            setPreviewUrl(null);
        }
    }, [externalLink, selectedFile]);

    // Cleanup preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Subscribe to Feed
    useEffect(() => {
        const unsubscribe = subscribeToFeed(
            (items) => {
                setFeed(items);
                setLoading(false);
            },
            (error) => {
                console.error('Feed subscription error:', error);
                setLoading(false);
                setFeedError(true);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleTranslate = async (id: string, text: string) => {
        if (translatedContent[id]) {
            // Toggle off translation
            const newTranslated = { ...translatedContent };
            delete newTranslated[id];
            setTranslatedContent(newTranslated);
            return;
        }

        setTranslatingId(id);
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLanguage: 'ko' }) // Default to Korean for demo, or detect user lang
            });
            const data = await res.json();
            if (data.translatedText) {
                setTranslatedContent(prev => ({ ...prev, [id]: data.translatedText }));
            }
        } catch (error) {
            console.error("Translation failed", error);
        } finally {
            setTranslatingId(null);
        }
    };

    const toggleComments = (id: string) => {
        setOpenCommentsId(prev => prev === id ? null : id);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePost = async () => {
        if (!user || !userProfile || (!selectedFile && !externalLink)) {
            alert("Please select a photo OR provide a link!"); // Updated alert
            return;
        }

        setIsSubmitting(true);
        try {
            let downloadUrl = "";
            let fileType: "video" | "image" | "text" = "text"; // Default to text/link only

            if (selectedFile) {
                // Check if file is an image
                if (!selectedFile.type.startsWith('image')) {
                    alert("Only image uploads are allowed directly. Please use a link for videos to save costs!");
                    setIsSubmitting(false);
                    return;
                }

                // Image Compression Logic
                const options = {
                    maxSizeMB: 1, // Max 1MB
                    maxWidthOrHeight: 1920, // Max 1080p equivalent
                    useWebWorker: true
                };

                try {
                    const compressedFile = await imageCompression(selectedFile, options);
                    console.log(`originalFile size ${selectedFile.size / 1024 / 1024} MB`);
                    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`);

                    // Upload Compressed File
                    const fileRef = ref(storage, `feed/${user.uid}/${Date.now()}_${compressedFile.name}`);
                    await uploadBytes(fileRef, compressedFile);
                    downloadUrl = await getDownloadURL(fileRef);
                    fileType = 'image';

                } catch (error) {
                    console.error("Compression failed:", error);
                    alert("Image compression failed. Please try a smaller image.");
                    setIsSubmitting(false);
                    return;
                }
            } else if (externalLink) {
                // If only link, use 'text' type
                fileType = 'text';

                // If YouTube link, save thumbnail as main URL for visual feed
                const ytThumb = getYouTubeThumbnail(externalLink);
                if (ytThumb) {
                    downloadUrl = ytThumb;
                    fileType = 'image'; // Treat as image so it renders the thumbnail
                }
            }

            await addFeedItem(
                userProfile,
                uploadContent,
                fileType,
                downloadUrl, // Can be empty string
                false,
                externalLink // Pass Link
            );

            // Reset Form
            setUploadContent('');
            setExternalLink(''); // Reset Link
            setSelectedFile(null);
            setPreviewUrl(null);
            setIsUploading(false);
        } catch (error) {
            console.error("Post failed", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            alert(`Failed to post content: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShare = (item: FeedItem) => {
        const shareText = `[BTS Army Global] ${item.author.name} posted: "${item.content}"\n${item.externalLink ? `Link: ${item.externalLink}` : ''}`;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Link copied to clipboard! 💜');
        });
    };

    const handleDelete = async (itemId: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await deleteFeedItem(itemId);
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete post.");
        }
    };

    // Helper to format timestamp
    const formatTime = (ts: Timestamp | null) => {
        if (!ts) return 'Just now';
        const date = ts.toDate();
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / 1000; // seconds

        if (diff < 60) return `${Math.floor(diff)}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Service Gate for Missing Service Number */}
            {userProfile && !userProfile.serviceNumber && (
                <ServiceGate onSuccess={() => user && getUserProfile(user.uid).then(setUserProfile)} />
            )}

            {/* 🚀 Mission Status Bar (Integrated Command Center) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <MissionWidget
                    icon={<Music className="text-bts-purple" />}
                    title="Streaming Goal"
                    value="98.5%"
                    subtext="Target: 100M views"
                    trend="up"
                />
                <MissionWidget
                    icon={<BarChart3 className="text-blue-400" />}
                    title="Global Trend"
                    value="#1 Worldwide"
                    subtext="#ForeverWithBTS"
                    trend="neutral"
                />
                <MissionWidget
                    icon={<AlertTriangle className="text-red-400" />}
                    title="Priority Directive"
                    value="MAMA Voting"
                    subtext="D-2 Left! Vote Now"
                    trend="urgent"
                />
            </div>

            {/* Header & Identity */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-6 sticky top-0 bg-black/80 backdrop-blur-xl z-30 pt-4 -mx-4 px-4 md:-mx-8 md:px-8">
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
                        <div
                            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center h-64 transition-colors cursor-pointer group relative overflow-hidden ${previewUrl ? 'border-bts-purple bg-black' : 'border-gray-600 bg-black/20 hover:border-bts-purple hover:bg-bts-purple/5'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/*" // Restrict to images only
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {previewUrl ? (
                                <Image src={previewUrl} alt="Preview" fill className="object-contain" />
                            ) : (
                                <>
                                    <Video className="w-12 h-12 text-gray-500 group-hover:text-bts-purple mb-4 transition-colors" />
                                    <p className="font-bold text-gray-300">Click to Upload Photo</p>
                                    <p className="text-xs text-start text-gray-500 mt-2">
                                        Max 10MB (Auto-Compressed).<br />
                                        For videos, please use a link.
                                    </p>
                                </>
                            )}
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

                            {/* Link Input */}
                            <input
                                type="text"
                                value={externalLink}
                                onChange={(e) => setExternalLink(e.target.value)}
                                placeholder="🔗 YouTube / Instagram Link (Optional)"
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-bts-purple text-sm"
                            />

                            <textarea
                                value={uploadContent}
                                onChange={(e) => setUploadContent(e.target.value)}
                                placeholder="Describe your moment... #BTS #ArmyLog"
                                className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-bts-purple"
                            />
                            <button
                                onClick={handlePost}
                                disabled={isSubmitting || (!selectedFile && !uploadContent && !externalLink)} // Enable if link exists
                                className="w-full py-3 bg-bts-purple text-white font-bold rounded-lg hover:bg-bts-purple-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Post to The Purple Carpet'
                                )}
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

                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="break-inside-avoid mb-6 rounded-2xl overflow-hidden bg-gray-900 border border-white/10">
                            <Skeleton className="w-full aspect-[9/16] bg-gray-800" />
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="w-24 h-3" />
                                        <Skeleton className="w-16 h-2" />
                                    </div>
                                </div>
                                <Skeleton className="w-full h-4" />
                                <Skeleton className="w-2/3 h-4" />
                            </div>
                        </div>
                    ))
                ) : feedError ? (
                    <div className="col-span-full text-center py-20 space-y-3">
                        <p className="text-red-400 font-bold">⚠️ 피드를 불러올 수 없습니다</p>
                        <p className="text-gray-500 text-sm">네트워크 연결을 확인하고 페이지를 새로고침해 주세요.</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-bts-purple text-white rounded-lg text-sm font-bold hover:bg-purple-600 transition-colors">
                            새로고침
                        </button>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        <p>{t('dashboard.no_content')}</p>
                    </div>
                ) : (
                    feed.map((story, index) => (
                        <div key={story.id} className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-bts-purple/50 transition-all duration-300">
                            {/* Media Placeholder - using img for real feed for now as we use picsum */}
                            {/* Media Placeholder - Only render if URL or External Link exists */}
                            {/* Media Placeholder - Only render if URL or External Link exists */}
                            {(story.url || story.externalLink) && (
                                <div className={`aspect-[9/16] relative bg-gray-800`}>
                                    {story.externalLink ? (
                                        // Creating a clickable wrapper for External Links (YouTube, etc.)
                                        <a
                                            href={story.externalLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full h-full relative cursor-pointer group/link"
                                        >
                                            {story.url ? (
                                                story.type === 'video' ? (
                                                    <video
                                                        src={story.url}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={story.url}
                                                        alt="content"
                                                        fill
                                                        priority={index < 2} // Optimize LCP
                                                        className="object-cover transition-transform duration-500 group-hover/link:scale-105"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                )
                                            ) : (
                                                /* Link Only Placeholder - No Thumbnail */
                                                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-900/50 group-hover:bg-gray-900 transition-colors">
                                                    <ExternalLink className="w-12 h-12 text-bts-purple opacity-50 mb-3 group-hover/link:scale-110 transition-transform" />
                                                    <p className="text-sm text-gray-400 font-bold group-hover/link:text-bts-purple transition-colors">{t('dashboard.tap_to_view')}</p>
                                                </div>
                                            )}

                                            {/* Play Button Overlay for Links */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/link:opacity-100 transition-opacity bg-black/20">
                                                <Play className="w-12 h-12 text-white fill-current drop-shadow-lg scale-110" />
                                            </div>
                                        </a>
                                    ) : (
                                        // Uploaded Media (No External Link)
                                        <>
                                            {story.url && (
                                                story.type === 'video' ? (
                                                    <video
                                                        src={story.url}
                                                        className="w-full h-full object-cover"
                                                        controls
                                                        playsInline
                                                        preload="metadata"
                                                    />
                                                ) : (
                                                    <Image
                                                        src={story.url}
                                                        alt="content"
                                                        fill
                                                        priority={index < 2}
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                )
                                            )}
                                        </>
                                    )}

                                    {/* 7s Indicator */}
                                    {story.type === 'video' && story.url && !story.externalLink && (
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 rounded text-[10px] font-bold text-white border border-white/20 pointer-events-none">
                                            0:07 / LOOP
                                        </div>
                                    )}
                                    {/* Link Indicator */}
                                    {story.externalLink && (
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-red-600/90 rounded text-[10px] font-bold text-white shadow-lg pointer-events-none flex items-center gap-1">
                                            <Play className="w-3 h-3 fill-current" />
                                            YouTube
                                        </div>
                                    )}

                                    {/* Army Log Tag */}
                                    {story.isOfficialArmyLog && (
                                        <div className="absolute top-3 left-3 px-2 py-0.5 bg-bts-purple/90 rounded text-[10px] font-bold text-white shadow-lg shadow-bts-purple/40 pointer-events-none">
                                            ARMY LOG OFFICIAL
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Info Overlay */}
                            <div className="p-4 bg-gradient-to-b from-gray-900 via-gray-900 to-black">
                                <div className="flex justify-between items-start mb-3">
                                    <Link href={`/dashboard/profile/${story.author.uid}`} className="flex items-center gap-2 group/author">
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 overflow-hidden relative border border-transparent group-hover/author:border-bts-purple transition-all">
                                            {story.author.avatar ? (
                                                <Image
                                                    src={story.author.avatar}
                                                    alt={story.author.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                story.author.name[0]
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white leading-none group-hover/author:text-bts-purple transition-colors">{story.author.name}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{story.author.rank} • {story.author.country}</p>
                                        </div>
                                    </Link>
                                    <div className="text-[10px] text-gray-500 font-mono">
                                        {formatTime(story.timestamp)}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-300 line-clamp-2">
                                        {translatedContent[story.id] || story.content}
                                    </p>

                                    {/* Link and Translate Actions */}
                                    <div className="flex items-center gap-3 mt-2">
                                        {story.externalLink && (
                                            <a
                                                href={story.externalLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Source
                                            </a>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTranslate(story.id, story.content);
                                            }}
                                            className="flex items-center gap-1 text-[10px] text-bts-purple hover:text-white transition-colors"
                                        >
                                            <Globe className="w-3 h-3" />
                                            {translatingId === story.id ? 'Translating...' : (translatedContent[story.id] ? 'See Original' : 'Translate to Korean')}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => user && toggleLike(story.id, userProfile || { uid: user.uid, displayName: user.displayName, photoURL: user.photoURL } as UserProfile)}
                                        className="flex items-center gap-1.5 text-gray-400 hover:text-bts-purple transition-colors group/btn"
                                    >
                                        <Heart
                                            className={cn(
                                                "w-4 h-4 transition-colors",
                                                story.likedBy?.includes(user?.uid || '') ? "fill-bts-purple text-bts-purple" : "group-hover/btn:text-bts-purple"
                                            )}
                                        />
                                        <span className={cn(
                                            "text-xs font-medium",
                                            story.likedBy?.includes(user?.uid || '') ? "text-bts-purple" : ""
                                        )}>
                                            {story.stats.likes}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => toggleComments(story.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 transition-colors",
                                            openCommentsId === story.id ? "text-bts-purple" : "text-gray-400 hover:text-white"
                                        )}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        <span className="text-xs font-medium">{story.stats.comments}</span>
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleShare(story)}
                                            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-xs font-medium">{story.stats.shares}</span>
                                        </button>
                                        {user?.uid === story.author.uid && (
                                            <button
                                                onClick={() => handleDelete(story.id)}
                                                className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Post"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Comment Section */}
                            {openCommentsId === story.id && (
                                <CommentSection
                                    feedId={story.id}
                                    currentUser={userProfile}
                                    onClose={() => setOpenCommentsId(null)}
                                />
                            )}
                        </div>
                    )))}

                {/* Ad In-Feed */}
                <div className="break-inside-avoid rounded-2xl overflow-hidden border border-white/5 bg-black/20 min-h-[200px] flex items-center justify-center">
                    <AdBanner dataAdSlot="feed-native" className="w-full h-full" />
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

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

function MissionWidget({ icon, title, value, subtext, trend }: { icon: React.ReactNode; title: string; value: string; subtext: string; trend: 'up' | 'neutral' | 'urgent' }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-900 to-black border border-white/5 hover:border-bts-purple/30 transition-all cursor-pointer group shadow-lg">
            <div className="p-3 rounded-full bg-white/5 group-hover:bg-bts-purple/20 transition-colors">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-white">{value}</h3>
                    {trend === 'urgent' && <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">URGENT</span>}
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{subtext}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-bts-purple transition-colors opacity-0 group-hover:opacity-100" />
        </div>
    )
}
