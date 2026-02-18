import { NextRequest, NextResponse } from 'next/server';

// Server-side Firestore write using Firebase REST API
// This bypasses the client-side SDK connection issues caused by Vercel's fetch wrapper

const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function getFirestoreToken(): Promise<string | null> {
    // Use the Firebase API key for server-side REST API calls
    // For production, use Firebase Admin SDK with service account
    return null;
}

async function verifyFirebaseToken(idToken: string): Promise<{ uid: string; email: string } | null> {
    try {
        // Verify the ID token using Firebase Auth REST API
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        const userInfo = data.users?.[0];
        if (!userInfo) return null;

        return { uid: userInfo.localId, email: userInfo.email };
    } catch {
        return null;
    }
}

async function getFirestoreDocument(uid: string, idToken: string) {
    try {
        const response = await fetch(
            `${FIRESTORE_BASE_URL}/users/${uid}`,
            {
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.status === 404) return null;
        if (!response.ok) return null;

        return await response.json();
    } catch {
        return null;
    }
}

async function setFirestoreDocument(uid: string, data: Record<string, unknown>, idToken: string) {
    // Convert data to Firestore REST API format
    const fields: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        } else if (typeof value === 'number') {
            fields[key] = { integerValue: String(value) };
        } else if (value === null || value === undefined) {
            fields[key] = { nullValue: null };
        } else if (typeof value === 'object' && 'REQUEST_TIME' in (value as object)) {
            // Server timestamp
            fields[key] = { timestampValue: new Date().toISOString() };
        }
    }

    const response = await fetch(
        `${FIRESTORE_BASE_URL}/users/${uid}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fields }),
        }
    );

    return response.ok;
}

export async function POST(request: NextRequest) {
    try {
        // Get ID token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const idToken = authHeader.substring(7);
        const { serviceNumber } = await request.json();

        // Verify the token
        const userInfo = await verifyFirebaseToken(idToken);
        if (!userInfo) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { uid, email } = userInfo;

        // Check if user document already exists
        const existingDoc = await getFirestoreDocument(uid, idToken);

        if (!existingDoc) {
            // Create new profile
            const role = serviceNumber === '0000-0000' ? 'admin' : 'user';
            const displayName = `Army-${serviceNumber || uid.slice(0, 4)}`;

            const newProfile = {
                uid,
                email: email || null,
                displayName,
                photoURL: null,
                rank: 'Recruit',
                role,
                serviceNumber: serviceNumber || '',
                country: 'KR',
                createdAt: { REQUEST_TIME: true },
                lastLogin: { REQUEST_TIME: true },
            };

            await setFirestoreDocument(uid, newProfile, idToken);
        } else {
            // Update lastLogin
            const updates: Record<string, unknown> = {
                lastLogin: { REQUEST_TIME: true },
            };

            // Check for admin role upgrade
            const existingData = existingDoc.fields;
            const existingServiceNumber = existingData?.serviceNumber?.stringValue;
            const existingRole = existingData?.role?.stringValue;

            if (existingServiceNumber === '0000-0000' && existingRole !== 'admin') {
                updates.role = 'admin';
            }

            await setFirestoreDocument(uid, updates, idToken);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('save-user API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
