'use client';

import { useEffect } from 'react';

export default function ConsoleFilter() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalError = console.error;
        const originalWarn = console.warn;

        console.error = (...args) => {
            const msg = args.map(a => String(a || '')).join(' ');

            // Filter out known security software noise
            if (
                msg.includes('AbortError') ||
                msg.includes('The user aborted a request') ||
                msg.includes('cloud.firestore') || // internal firestore offline noise
                msg.includes('frame_ant.js') ||
                msg.includes('frame_start.js')
            ) {
                // Suppress or downgrade to debug
                // console.debug('[Suppressed External Error]', ...args);
                return;
            }

            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            const msg = args.map(a => String(a || '')).join(' ');
            if (msg.includes('Duplicate app') || msg.includes('IndexedDbPersistence')) {
                return;
            }
            originalWarn.apply(console, args);
        }

        // Attempt to patch window.onerror to prevent "Uncaught" red banners in some dev tools
        const originalOnError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            const msgStr = String(message);
            if (
                msgStr.includes('removeChild') ||
                msgStr.includes('AbortError') ||
                (source && (source.includes('frame_ant') || source.includes('frame_start')))
            ) {
                console.debug('[Suppressed Global Error]', message);
                return true; // Prevent default handler (suppress)
            }
            return originalOnError ? originalOnError(message, source, lineno, colno, error) : false;
        };

        return () => {
            console.error = originalError;
            console.warn = originalWarn;
            window.onerror = originalOnError;
        };
    }, []);

    return null;
}
