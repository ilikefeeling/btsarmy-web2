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
// Format: 0000-0000 (4 digits - 4 digits)
const MOCK_SERVICE_NUMBERS = [
    '2470-0001', '2470-0002', '2470-0003', // 2024 enlistments
    '0000-0000', // Special admin code
    '9999-9999' // QA Test Account
];

export async function verifyServiceNumber(serviceNumber: string): Promise<{ success: boolean; message: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 1. Format Validation (0000-0000)
    const formatRegex = /^\d{4}-\d{4}$/;
    if (!formatRegex.test(serviceNumber)) {
        return { success: false, message: 'Invalid format. Use 0000-0000 (e.g., 2470-0001).' };
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
