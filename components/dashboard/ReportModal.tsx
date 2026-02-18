'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { addReport, UserProfile } from '@/lib/db';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    targetType: 'feed' | 'comment';
    reportedUser: { uid: string, name: string } | null;
    currentUser: UserProfile;
}

const REPORT_REASONS = [
    'Spam or unwanted commercial content',
    'Harassment or bullying',
    'Hate speech or graphic violence',
    'Nudity or sexual activity',
    'False information',
    'Other'
];

export default function ReportModal({ isOpen, onClose, targetId, targetType, reportedUser, currentUser }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await addReport(targetId, targetType, selectedReason, description, currentUser, reportedUser);
            alert('Report submitted. Thank you for making this community safer.');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/40">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Report Content
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-300">
                        Why are you reporting this {targetType}?
                    </p>

                    <div className="space-y-2">
                        {REPORT_REASONS.map((reason) => (
                            <label key={reason} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason}
                                    checked={selectedReason === reason}
                                    onChange={(e) => setSelectedReason(e.target.value)}
                                    className="w-4 h-4 text-bts-purple border-gray-600 focus:ring-bts-purple bg-gray-700"
                                />
                                <span className="text-sm text-white">{reason}</span>
                            </label>
                        ))}
                    </div>

                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Additional details (optional)..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-bts-purple/50 min-h-[80px]"
                    />
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-full transition-colors flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
}
