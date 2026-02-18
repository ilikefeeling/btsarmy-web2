'use client';

import { useState, useEffect } from 'react';

export default function HydrationGuard({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // Prevent hydration mismatch by rendering a hidden placeholder
        // This matching the user's specific request to block initial render paint
        return <div style={{ visibility: 'hidden' }}>{children}</div>;
    }

    return <>{children}</>;
}
