'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Send, Trash2, MoreHorizontal, Loader2, CornerDownRight, X, Flag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { addComment, deleteComment, subscribeToComments, Comment, UserProfile } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import ReportModal from './ReportModal';

interface CommentSectionProps {
    feedId: string;
    currentUser: UserProfile | null;
    onClose: () => void;
}

export default function CommentSection({ feedId, currentUser, onClose }: CommentSectionProps) {
    const { t } = useLanguage();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<{ id: string, user: { uid: string, name: string } } | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Subscribe to comments
    useEffect(() => {
        const unsubscribe = subscribeToComments(feedId, (items) => {
            setComments(items);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [feedId]);

    // Group comments into threads
    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsSubmitting(true);
        try {
            await addComment(
                feedId,
                currentUser,
                newComment,
                replyingTo?.id || null,
                replyingTo ? replyingTo.user : null
            );
            setNewComment('');
            setReplyingTo(null);
        } catch (error) {
            console.error(error);
            alert('Failed to post comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await deleteComment(feedId, commentId);
        } catch (error) {
            console.error(error);
            alert('Failed to delete comment');
        }
    };

    const formatTime = (ts: Timestamp) => {
        if (!ts) return '';
        return formatDistanceToNow(ts.toDate(), { addSuffix: true });
    };

    const [reportTarget, setReportTarget] = useState<{ id: string, author: { uid: string, name: string } } | null>(null);

    return (
        <div className="bg-black/40 border-t border-white/5 p-4 animate-in slide-in-from-top-2 duration-300">
            {/* Report Modal for Comments */}
            {reportTarget && currentUser && (
                <ReportModal
                    isOpen={!!reportTarget}
                    onClose={() => setReportTarget(null)}
                    targetId={reportTarget.id}
                    targetType="comment"
                    reportedUser={reportTarget.author}
                    currentUser={currentUser}
                />
            )}

            {/* Header / Loading */}
            {loading && (
                <div className="space-y-4 mb-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="w-8 h-8 rounded-full bg-gray-700" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="w-1/4 h-3 bg-gray-700" />
                                <Skeleton className="w-3/4 h-3 bg-gray-700" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar mb-4 pr-1">
                {!loading && comments.length === 0 && (
                    <p className="text-center text-xs text-gray-500 py-4">
                        Be the first to comment! 💜
                    </p>
                )}

                {rootComments.map((comment) => (
                    <div key={comment.id} className="group">
                        <CommentItem
                            comment={comment}
                            currentUser={currentUser}
                            onReply={() => setReplyingTo({ id: comment.id, user: comment.author })}
                            onDelete={() => handleDelete(comment.id)}
                            onReport={(c) => setReportTarget({ id: c.id, author: c.author })}
                            formatTime={formatTime}
                        />

                        {/* Replies */}
                        <div className="ml-8 mt-2 space-y-2 border-l border-white/10 pl-3">
                            {getReplies(comment.id).map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUser={currentUser}
                                    onReply={() => setReplyingTo({ id: comment.id, user: reply.author })}
                                    onDelete={() => handleDelete(reply.id)}
                                    onReport={(c) => setReportTarget({ id: c.id, author: c.author })}
                                    formatTime={formatTime}
                                    isReply
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Form */}
            <div className="relative">
                {replyingTo && (
                    <div className="flex items-center justify-between text-xs text-bts-purple bg-bts-purple/10 px-3 py-1.5 rounded-t-lg border-x border-t border-bts-purple/20">
                        <span className="flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3" />
                            Replying to {replyingTo.user.name}
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={cn(
                    "flex gap-2 items-center relative p-2 bg-white/5 border border-white/10",
                    replyingTo ? "rounded-b-xl border-t-0" : "rounded-full"
                )}>
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 overflow-hidden relative border border-white/10 opacity-50">
                        {currentUser?.photoURL ? (
                            <Image src={currentUser.photoURL} alt="Me" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                {currentUser?.displayName?.[0] || '?'}
                            </div>
                        )}
                    </div>

                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-gray-500"
                        disabled={isSubmitting}
                        autoFocus={!!replyingTo}
                    />

                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="p-1.5 bg-bts-purple text-white rounded-full disabled:opacity-50 disabled:bg-gray-700 hover:bg-bts-purple-dark transition-colors"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    currentUser: UserProfile | null;
    onReply: () => void;
    onDelete: () => void;
    onReport: (comment: Comment) => void;
    formatTime: (ts: Timestamp) => string;
    isReply?: boolean;
}

function CommentItem({ comment, currentUser, onReply, onDelete, onReport, formatTime, isReply }: CommentItemProps) {
    return (
        <div className="flex gap-3 group relative">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden relative border border-white/10">
                {comment.author.avatar ? (
                    <Image
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        {comment.author.name[0]}
                    </div>
                )}
            </div>
            <div className="flex-1">
                <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                        {comment.author.name}
                        <span className="text-[10px] text-bts-purple/80 font-normal border border-bts-purple/20 px-1 rounded">
                            {comment.author.rank}
                        </span>
                    </span>
                    <span className="text-[10px] text-gray-600">
                        {formatTime(comment.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-gray-200 mt-0.5 leading-relaxed break-words">
                    {comment.replyTo && (
                        <span className="text-bts-purple mr-1">@{comment.replyTo.name}</span>
                    )}
                    {comment.text}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onReply} className="text-[10px] text-gray-500 hover:text-white font-bold cursor-pointer">
                        Reply
                    </button>
                    {currentUser?.uid === comment.author.uid ? (
                        <button onClick={onDelete} className="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer">
                            Delete
                        </button>
                    ) : (
                        <button
                            onClick={() => onReport(comment)}
                            className="text-[10px] text-gray-500 hover:text-yellow-500 cursor-pointer flex items-center gap-1"
                        >
                            <Flag className="w-3 h-3" /> Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
