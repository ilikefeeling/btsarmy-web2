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
            const reason = event.reason;
            const message = reason?.message || String(reason);

            // Only trigger for genuine Firestore offline errors.
            // Explicitly ignore AbortError — these are caused by browser extensions
            // or network retries (e.g. Firestore reconnection attempts) and are NOT
            // real offline states.
            if (reason?.name === 'AbortError') return;

            const isFirestoreOffline =
                message.includes('client is offline') ||
                message.includes('Failed to get document because the client is offline');

            if (isFirestoreOffline) {
                console.error('NetworkMonitor: Firestore offline error detected', reason);
                setIsOfflineError(true);
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
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
