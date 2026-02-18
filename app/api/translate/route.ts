import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

export async function POST(req: NextRequest) {
    if (!API_KEY) {
        // Mock response if no API key is set
        return NextResponse.json({
            translatedText: "Translation API Key missing. This is a mock translation."
        });
    }

    try {
        const { text, targetLanguage = 'ko' } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLanguage,
                format: 'text'
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const translatedText = data.data.translations[0].translatedText;

        return NextResponse.json({ translatedText });
    } catch (error: unknown) {
        console.error('Translation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
