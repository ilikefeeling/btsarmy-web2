// Mock AI Logic for Content Moderation and Trend Analysis

export interface ModerationResult {
    isSafe: boolean;
    flaggedCategories: string[];
    score: number;
}

export interface TrendTopic {
    keyword: string;
    volume: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    relatedProduct?: string; // Affiliate link or internal market link
}

// Mock Google Perspective API
export async function checkContentSafety(text: string): Promise<ModerationResult> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));

    const lowerText = text.toLowerCase();
    const flaggedCategories: string[] = [];

    // Simple keyword matching for demo purposes
    if (lowerText.includes('hate') || lowerText.includes('stupid') || lowerText.includes('idiot')) {
        flaggedCategories.push('TOXICITY');
    }
    if (lowerText.includes('buy now') || lowerText.includes('click here') || lowerText.includes('http')) {
        flaggedCategories.push('SPAM');
    }

    // Strict mode for "Anti-Fan" behavior
    if (lowerText.includes('anti') || lowerText.includes('disband')) {
        flaggedCategories.push('THREAT');
    }

    const isSafe = flaggedCategories.length === 0;
    const score = isSafe ? 0.1 : 0.9; // Low score = safe, High score = toxic

    return { isSafe, flaggedCategories, score };
}

// Mock Trend Analysis Algorithm
export async function getDailyHotTopics(): Promise<TrendTopic[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
        {
            keyword: '#ForeverWithBTS',
            volume: 154000,
            sentiment: 'positive',
            relatedProduct: '/dashboard/market?q=album'
        },
        {
            keyword: 'MAMA Voting',
            volume: 89000,
            sentiment: 'neutral',
            relatedProduct: '/dashboard/market?q=lightstick'
        },
        {
            keyword: 'Jungkook Live',
            volume: 120000,
            sentiment: 'positive',
            relatedProduct: '/dashboard/market?q=golden'
        },
        {
            keyword: 'Sold Out',
            volume: 45000,
            sentiment: 'negative',
            relatedProduct: undefined
        },
        {
            keyword: 'Purple Whale',
            volume: 32000,
            sentiment: 'positive',
            relatedProduct: '/dashboard/market?q=plushie'
        }
    ];
}
