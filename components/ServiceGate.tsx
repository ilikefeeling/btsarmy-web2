'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { saveUser } from '@/lib/db';
import { verifyServiceNumber } from '@/lib/auth';

interface ServiceGateProps {
    onSuccess: () => void;
}

export default function ServiceGate({ onSuccess }: ServiceGateProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [serviceNumber, setServiceNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            // 1. Format & Basic Validation
            const result = await verifyServiceNumber(serviceNumber);
            if (!result.success) {
                throw new Error(t('auth.verify_error_format'));
            }

            // 2. Save to Profile (This triggers duplicate check in DB)
            await saveUser(user, serviceNumber);

            // 3. Success
            onSuccess();
        } catch (err: any) {
            console.error(err);
            // Check if error message is about conflict
            if (err.message && err.message.includes('already in use')) {
                setError(t('auth.verify_error_taken'));
            } else {
                setError(err.message || 'Verification failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 glass-card rounded-2xl shadow-2xl border border-white/10 relative bg-black"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 rounded-full bg-bts-purple/20 mb-4 animate-pulse">
                        <ShieldCheck className="w-12 h-12 text-bts-purple" />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-bts-purple to-purple-400 glow-text">
                        {t('auth.verify_title')}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 text-center">
                        {t('auth.verify_desc')}
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="service-number" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('auth.serviceNumber')}
                        </label>
                        <input
                            id="service-number"
                            type="text"
                            placeholder={t('auth.verify_placeholder')}
                            value={serviceNumber}
                            onChange={(e) => setServiceNumber(e.target.value)}
                            className={cn(
                                "w-full px-4 py-3 bg-black/40 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300",
                                error
                                    ? "border-red-500 focus:ring-red-500/50"
                                    : "border-white/10 focus:border-bts-purple focus:ring-bts-purple/50"
                            )}
                            disabled={loading}
                        />
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-400 text-xs mt-2 ml-1"
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-bts-purple to-bts-purple-dark rounded-lg font-bold text-white shadow-lg shadow-bts-purple/25 hover:shadow-bts-purple/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('common.loading')}
                            </>
                        ) : (
                            t('auth.verify_btn')
                        )}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/5 text-center">
                    <p className="text-xs text-gray-500">
                        * One account per service number policy is strictly enforced. <br />
                        * Duplicates will be rejected by the system.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
