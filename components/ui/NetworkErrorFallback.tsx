'use client';

import { motion } from 'framer-motion';
import { WifiOff, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';

interface NetworkErrorFallbackProps {
    onRetry: () => void;
}

export default function NetworkErrorFallback({ onRetry }: NetworkErrorFallbackProps) {
    // Try to determine if we are in an in-app browser
    const isInApp = typeof window !== 'undefined' && /Line|Instagram|FBAN|FBAV/i.test(navigator.userAgent);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 px-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass-card p-6 md:p-8 rounded-2xl text-center space-y-6 border border-white/10 shadow-2xl bg-black/80"
            >
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20"
                >
                    <WifiOff className="w-10 h-10 text-red-500" />
                </motion.div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Connection Blocked
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Current network or browser settings are preventing access to the database.
                    </p>
                </div>

                {isInApp && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-left flex gap-3 items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-yellow-200/80 space-y-1">
                            <p className="font-semibold text-yellow-500">In-App Browser Detected</p>
                            <p>Some features are restricted in this environment.</p>
                            <p className="text-white mt-1">Please open in <strong>Chrome</strong> or <strong>Safari</strong>.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white/5 p-4 rounded-lg text-left text-xs text-gray-500 space-y-2">
                    <p className="text-gray-400 font-medium">Troubleshooting:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Switch between <span className="text-white">Wi-Fi</span> and <span className="text-white">Mobile Data</span>.</li>
                        <li>Disable any <span className="text-white">AdBlockers</span> or <span className="text-white">VPN</span>.</li>
                        <li>Try reloading the page.</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={onRetry}
                        className="w-full py-3.5 bg-gradient-to-r from-bts-purple to-purple-600 hover:from-purple-600 hover:to-bts-purple text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Retry Connection
                    </button>
                    <button
                        onClick={() => {
                            // Attempt to open system browser via intent (Android) or window.open
                            const url = window.location.href;
                            window.open(url, '_system');
                        }}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-medium transition-all text-sm flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Open in External Browser
                    </button>
                </div>

                <p className="text-[10px] text-gray-700 font-mono">
                    Code: firestore_offline_persistence_error
                </p>
            </motion.div>
        </div>
    );
}
