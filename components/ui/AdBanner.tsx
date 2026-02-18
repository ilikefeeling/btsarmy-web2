'use client';

import { useState, useEffect } from 'react';

interface AdBannerProps {
    dataAdSlot: string;
    dataAdFormat?: string;
    dataFullWidthResponsive?: boolean;
    className?: string;
}

export default function AdBanner({
    dataAdSlot,
    dataAdFormat = 'auto',
    dataFullWidthResponsive = true,
    className = '',
}: AdBannerProps) {
    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        // Check if we are in development environment
        if (process.env.NODE_ENV === 'development') {
            setIsDev(true);
        } else {
            // Load AdSense script if not already loaded
            // This is a simplified example. In production, you'd likely use a library or a more robust script loader.
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, []);

    if (isDev) {
        return (
            <div
                className={`bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center p-4 text-center text-gray-400 text-sm animate-pulse ${className}`}
                style={{ minHeight: '100px' }}
            >
                <span>
                    <strong>Google AdSense</strong><br />
                    Slot: {dataAdSlot}<br />
                    (Visible in Production)
                </span>
            </div>
        );
    }

    return (
        <div className={`ad-container overflow-hidden rounded-lg ${className}`}>
            <ins
                className="adsbygoogle block"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with actual Publisher ID
                data-ad-slot={dataAdSlot}
                data-ad-format={dataAdFormat}
                data-full-width-responsive={dataFullWidthResponsive.toString()}
            />
        </div>
    );
}
