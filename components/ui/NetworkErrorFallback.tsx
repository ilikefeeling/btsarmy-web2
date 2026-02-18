'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';

interface NetworkErrorFallbackProps {
    onRetry: () => void;
}

export default function NetworkErrorFallback({ onRetry }: NetworkErrorFallbackProps) {
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
                        연결 오류
                    </h2>
                    <p className="text-gray-400 text-sm">
                        데이터베이스 연결에 실패했습니다. 네트워크 상태를 확인해주세요.
                    </p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg text-left text-xs text-gray-500 space-y-2">
                    <p className="text-gray-400 font-medium">해결 방법:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li><span className="text-white">Wi-Fi</span>와 <span className="text-white">모바일 데이터</span>를 전환해보세요.</li>
                        <li><span className="text-white">AdBlocker</span> 또는 <span className="text-white">VPN</span>을 비활성화해보세요.</li>
                        <li>페이지를 새로고침해보세요.</li>
                    </ul>
                </div>

                <button
                    onClick={onRetry}
                    className="w-full py-3.5 bg-gradient-to-r from-bts-purple to-purple-600 hover:from-purple-600 hover:to-bts-purple text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    다시 연결
                </button>
            </motion.div>
        </div>
    );
}
