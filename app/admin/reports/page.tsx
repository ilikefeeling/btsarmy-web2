'use client';

import { useState, useEffect } from 'react';
import { getReports, resolveReport, Report } from '@/lib/db';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Check, Trash2, Ban, ExternalLink, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await getReports('pending');
            setReports(data);
        } catch (error) {
            console.error("Failed to load reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (report: Report, action: 'delete' | 'ban' | 'dismiss') => {
        if (!confirm(`Are you sure you want to ${action.toUpperCase()}?`)) return;

        setActionLoading(report.id);
        try {
            await resolveReport(report.id, action, report.targetId, report.targetType);
            // Optimistic update
            setReports(prev => prev.filter(r => r.id !== report.id));
        } catch (error) {
            console.error(error);
            alert("Action failed.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    Report Management
                </h1>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-900 border border-white/10 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between">
                                        <Skeleton className="w-20 h-4 bg-gray-800" />
                                        <Skeleton className="w-24 h-3 bg-gray-800" />
                                    </div>
                                    <Skeleton className="w-full h-12 bg-gray-800 rounded-lg" />
                                    <div className="flex gap-4">
                                        <Skeleton className="w-32 h-4 bg-gray-800" />
                                        <Skeleton className="w-32 h-4 bg-gray-800" />
                                    </div>
                                </div>
                                <div className="w-full md:w-32 space-y-2">
                                    <Skeleton className="w-full h-8 bg-gray-800" />
                                    <Skeleton className="w-full h-8 bg-gray-800" />
                                    <Skeleton className="w-full h-8 bg-gray-800" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                Report Management
            </h1>

            {reports.length === 0 ? (
                <div className="bg-gray-900/50 border border-white/5 rounded-xl p-8 text-center text-gray-500">
                    <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    No pending reports. Great job!
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-gray-900 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                            {/* Processing Overlay */}
                            {actionLoading === report.id && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Report Info */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 mb-2 border border-red-500/20">
                                                {report.reason}
                                            </span>
                                            <h3 className="text-lg font-bold text-white">
                                                Reported Info
                                            </h3>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true })}
                                        </span>
                                    </div>

                                    <div className="bg-black/40 rounded-lg p-3 text-sm text-gray-300 border border-white/5">
                                        <p className="text-xs text-gray-500 mb-1">Reporter says:</p>
                                        "{report.description || "No description provided."}"
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-600">Reporter:</span>
                                            <span className="text-white">{report.reportedBy.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-600">Target User:</span>
                                            <span className="text-red-400 font-bold">{report.reportedUser?.name || 'Unknown'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col justify-center gap-2 min-w-[150px] border-l border-white/10 pl-6 border-t md:border-t-0 pt-4 md:pt-0">
                                    <p className="text-xs text-gray-500 mb-2 text-center">Actions</p>

                                    <button
                                        onClick={() => handleAction(report, 'dismiss')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors border border-white/5"
                                    >
                                        <Check className="w-4 h-4" /> Dismiss
                                    </button>

                                    <button
                                        onClick={() => handleAction(report, 'delete')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm rounded-lg transition-colors border border-red-500/20"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Content
                                    </button>

                                    <button
                                        onClick={() => handleAction(report, 'ban')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm rounded-lg transition-colors border border-red-900/40"
                                    >
                                        <Ban className="w-4 h-4" /> Ban User
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
