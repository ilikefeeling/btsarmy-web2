import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { path, method = 'GET', data, queryParams } = body;

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        if (!projectId) {
            return NextResponse.json({ error: 'Project ID not configured' }, { status: 500 });
        }

        let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`;

        if (queryParams) {
            const params = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                const value = queryParams[key];
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v));
                } else {
                    params.append(key, String(value));
                }
            });
            url += `?${params.toString()}`;
        }

        const fetchOptions: RequestInit = {
            method,
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        };

        if (data && (method === 'POST' || method === 'PATCH')) {
            fetchOptions.body = JSON.stringify(data);
        }

        console.log(`[Firestore Proxy] ${method} ${url}`);

        const response = await fetch(url, fetchOptions);
        const responseData = await response.json();

        if (!response.ok) {
            console.error('[Firestore Proxy Error]', responseData);
            return NextResponse.json(responseData, { status: response.status });
        }

        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('[Firestore Proxy Internal Error]', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
