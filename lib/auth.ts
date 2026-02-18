// Mock Service Number Validation Logic
// In production, this would verify against a secure database or external API

interface UserProfile {
    uid: string;
    serviceNumber: string;
    username: string;
    rank: 'trainee' | 'soldier' | 'commander';
    isVerified: boolean;
}

// Mock Database of Service Numbers (for initial testing)
const MOCK_SERVICE_NUMBERS = [
    '24-70001', '24-70002', '24-70003', // 2024 enlistments
    '13-61300', // Special admin code
    '99-99999' // QA Test Account
];

export async function verifyServiceNumber(serviceNumber: string): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 1. Format Validation (YY-NXXXX)
    const formatRegex = /^\d{2}-\d{5}$/;
    if (!formatRegex.test(serviceNumber)) {
        return { success: false, message: 'Invalid format. Use YY-XXXXX (e.g., 24-12345).' };
    }

    // 2. Mock Database Check
    if (MOCK_SERVICE_NUMBERS.includes(serviceNumber)) {
        return { success: true, message: 'Service number verified.' };
    }

    // default allow for testing if mock mode is enabled, otherwise fail
    // For this MVP, we will fail if not in the list to enforce "exclusive" feel
    return { success: false, message: 'Service number not found in the official registry.' };
}

export async function checkDuplicateAccount(serviceNumber: string): Promise<boolean> {
    // TODO: Check against Firestore 'users' collection where serviceNumber == input
    // Return true if verification doc exists
    return false; // Mock: always false (no duplicate) for now
}
