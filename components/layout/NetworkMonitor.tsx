'use client';

import { useEffect, useState } from 'react';
import NetworkErrorFallback from '@/components/ui/NetworkErrorFallback';
import { usePathname } from 'next/navigation';

export default function NetworkMonitor() {
    const [isOfflineError, setIsOfflineError] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Reset error on navigation to give user a chance to recover
        setIsOfflineError(false);

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            // Check for specific Firestore offline error
            // Error: FirebaseError: Failed to get document because the client is offline.
            // Error: FirebaseError: initializeFirestore() has already been called
            const reason = event.reason;
            const message = reason?.message || String(reason);

            if (message.includes('client is offline') ||
                message.includes('internet connection') ||
                message.includes('network request failed')) {
                console.error("NetworkMonitor: Caught offline error", reason);
                setIsOfflineError(true);
            }
        };

        const handleOnline = () => {
            // If we come back online, maybe try to clear the error?
            // But Firestore might still be in a bad state until reload.
            // We'll let the user click "Retry" which triggers reload or state reset.
        };

        const handleOffline = () => {
            // System reports offline, but we only block if an actual request fails
            // or maybe we should just show a toast?
            // For now, let's rely on the Promise Rejection which is the real blocker.
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [pathname]);

    if (!isOfflineError) return null;

    return (
        <NetworkErrorFallback
            onRetry={() => {
                setIsOfflineError(false);
                window.location.reload();
            }}
        />
    );
}
