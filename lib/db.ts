import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    limit,
    Timestamp,
    getDocs,
    deleteDoc,
    where
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './firebase'; // Import db from firebase.ts

// --- User Types ---
export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    rank: 'Recruit' | 'Soldier' | 'Commander'; // Army Ranks
    role: 'admin' | 'user'; // New Role Field
    serviceNumber: string; // e.g., 24-70001
    country: string;
    createdAt: Timestamp;
    lastLogin: Timestamp;
}

// --- Feed Types ---
export interface FeedItem {
    id: string;
    type: 'video' | 'image';
    url: string;
    thumbnail?: string;
    author: {
        uid: string;
        name: string;
        rank: string;
        avatar: string;
        country: string;
    };
    content: string;
    tags: string[];
    stats: {
        likes: number;
        comments: number;
        shares: number;
    };
    isOfficialArmyLog: boolean;
    timestamp: Timestamp;
    externalLink?: string; // Optional link field
    likedBy?: string[]; // Array of UIDs who liked the post
}

// --- User Operations ---

export async function saveUser(user: User, serviceNumber?: string) {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // Determine Service Number
        // If not provided (e.g. legacy google login if allowed, or extracted from email), try to extract or default
        let finalServiceNumber = serviceNumber || '';
        if (!finalServiceNumber && user.email && user.email.endsWith('@army.bts')) {
            finalServiceNumber = user.email.split('@')[0];
        }

        // Check availability
        const taken = await isServiceNumberTaken(finalServiceNumber, user.uid);
        if (taken) {
            throw new Error(`Service Number ${finalServiceNumber} is already in use by another account.`);
        }

        // Auto-assign Admin Role for specific ID
        const role = finalServiceNumber === '0000-0000' ? 'admin' : 'user';

        // Create new profile
        const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || `Army-${finalServiceNumber || user.uid.slice(0, 4)}`,
            photoURL: user.photoURL,
            rank: 'Recruit',
            role: role,
            serviceNumber: finalServiceNumber,
            country: 'KR', // Default, should detect from IP or ask user
            createdAt: serverTimestamp() as Timestamp,
            lastLogin: serverTimestamp() as Timestamp,
        };
        await setDoc(userRef, newProfile);
    } else {
        // Update existing profile
        const updates: any = {
            lastLogin: serverTimestamp(),
        };

        // Retroactive Admin Fix for Existing Users
        const data = userSnap.data();
        if ((data?.serviceNumber === '0000-0000' || user.email?.startsWith('0000-0000')) && data?.role !== 'admin') {
            updates.role = 'admin';
        }

        // If service number is being updated/set and wasn't there before or is different
        // Only if explicit serviceNumber is passed to saveUser
        if (serviceNumber && data?.serviceNumber !== serviceNumber) {
            const taken = await isServiceNumberTaken(serviceNumber, user.uid);
            if (taken) {
                throw new Error(`Service Number ${serviceNumber} is already in use by another account.`);
            }
            updates.serviceNumber = serviceNumber;
        }

        await updateDoc(userRef, updates);
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
    }
    return null;
}

export async function isServiceNumberTaken(serviceNumber: string, excludeUid?: string): Promise<boolean> {
    if (!serviceNumber) return false;

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('serviceNumber', '==', serviceNumber));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return false;

    // If excludeUid is provided, check if the found doc is NOT the current user
    if (excludeUid) {
        return snapshot.docs.some(doc => doc.id !== excludeUid);
    }

    return true;
}

// --- Admin Operations ---

export async function getAllUsers(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function updateUserRank(uid: string, newRank: UserProfile['rank']) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { rank: newRank });
}

// --- Feed Operations ---

export function subscribeToFeed(callback: (items: FeedItem[]) => void) {
    const q = query(
        collection(db, 'global_lounge_feed'),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FeedItem[];
        callback(items);
    });
}

export async function addFeedItem(
    user: UserProfile,
    content: string,
    type: 'video' | 'image' | 'text', // Added 'text' type for link-only posts
    url?: string, // Made Optional
    isOfficial: boolean = false,
    externalLink?: string // New Argument
) {
    const newItem = {
        type,
        url: url || null, // Handle empty URL, store as null if not provided
        thumbnail: type === 'video' ? 'bg-gray-900' : null,
        author: {
            uid: user.uid,
            name: user.displayName || 'Unknown',
            rank: user.rank,
            avatar: user.photoURL || '',
            country: user.country
        },
        content,
        tags: ['ArmyLog'], // Default tag
        stats: {
            likes: 0,
            comments: 0,
            shares: 0
        },
        likedBy: [], // Initialize empty array
        isOfficialArmyLog: isOfficial,
        timestamp: serverTimestamp(),
        externalLink: externalLink || null // Save to DB
    };

    await addDoc(collection(db, 'global_lounge_feed'), newItem);
}

// Transaction for Like Feature
import { runTransaction } from 'firebase/firestore';

// Update signature to take UserProfile
export async function toggleLike(feedId: string, user: UserProfile) {
    if (!feedId || !user) return;

    const feedRef = doc(db, 'global_lounge_feed', feedId);
    let shouldNotify = false;
    let targetUid = '';

    try {
        await runTransaction(db, async (transaction) => {
            const feedDoc = await transaction.get(feedRef);
            if (!feedDoc.exists()) {
                throw "Document does not exist!";
            }

            const data = feedDoc.data() as FeedItem;
            const likedBy = data.likedBy || [];
            const currentLikes = data.stats?.likes || 0;

            if (likedBy.includes(user.uid)) {
                // Unlike
                const newLikedBy = likedBy.filter(uid => uid !== user.uid);
                transaction.update(feedRef, {
                    likedBy: newLikedBy,
                    'stats.likes': Math.max(0, currentLikes - 1)
                });
            } else {
                // Like
                const newLikedBy = [...likedBy, user.uid];
                transaction.update(feedRef, {
                    likedBy: newLikedBy,
                    'stats.likes': currentLikes + 1
                });

                shouldNotify = true;
                targetUid = data.author.uid;
            }
        });

        // Send Notification if needed (After transaction)
        if (shouldNotify && targetUid) {
            await sendNotification(targetUid, 'like', user, feedId);
        }

    } catch (e) {
        console.error("Transaction failed: ", e);
    }
}

export async function deleteFeedItem(feedId: string) {
    if (!feedId) return;
    await deleteDoc(doc(db, 'global_lounge_feed', feedId));
}

export async function getUserPosts(uid: string): Promise<FeedItem[]> {
    if (!uid) return [];

    const q = query(
        collection(db, 'global_lounge_feed'),
        where('author.uid', '==', uid),
        orderBy('timestamp', 'desc'),
        limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as FeedItem[];
}

// --- Market Types ---
export interface MarketItem {
    id: string;
    title: string;
    price: number;
    description: string;
    category: 'Photocard' | 'Album' | 'Merch' | 'Fashion' | 'Other';
    images: string[];
    seller: {
        uid: string;
        alias: string;
        rank: string;
        serviceNumber: string;
    };
    status: 'selling' | 'reserved' | 'sold';
    createdAt: Timestamp;
}

// --- Market Operations ---

export async function addMarketItem(
    user: UserProfile,
    title: string,
    price: number,
    description: string,
    category: MarketItem['category'],
    imageUrls: string[]
) {
    const newItem = {
        title,
        price,
        description,
        category,
        images: imageUrls,
        seller: {
            uid: user.uid,
            alias: user.displayName || 'Unknown',
            rank: user.rank,
            serviceNumber: user.serviceNumber
        },
        status: 'selling',
        createdAt: serverTimestamp()
    };

    await addDoc(collection(db, 'market_items'), newItem);
}

export function subscribeToMarket(callback: (items: MarketItem[]) => void) {
    const q = query(
        collection(db, 'market_items'),
        orderBy('createdAt', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MarketItem[];
        callback(items);
    });
}
// --- Comment Types ---
export interface Comment {
    id: string;
    feedId: string;
    text: string;
    author: {
        uid: string;
        name: string;
        rank: string;
        avatar: string;
    };
    createdAt: Timestamp;
    parentId?: string | null; // For threading
    replyTo?: {
        uid: string;
        name: string;
    } | null;
}

// ...

// --- Notification Types ---
export interface Notification {
    id: string;
    type: 'like' | 'comment' | 'reply' | 'mention'; // Added types
    fromUser: {
        uid: string;
        name: string;
        avatar: string;
    };
    feedId: string;
    isRead: boolean;
    createdAt: Timestamp;
}

// --- Comment Operations ---

export async function addComment(
    feedId: string,
    user: UserProfile,
    text: string,
    parentId: string | null = null,
    replyToUser: { uid: string, name: string } | null = null
) {
    if (!feedId || !text.trim()) return;

    const commentData = {
        feedId,
        text: text.trim(),
        author: {
            uid: user.uid,
            name: user.displayName || 'Unknown',
            rank: user.rank || 'ARMY',
            avatar: user.photoURL || ''
        },
        createdAt: serverTimestamp(),
        parentId: parentId || null,
        replyTo: replyToUser || null
    };

    const feedRef = doc(db, 'global_lounge_feed', feedId);
    const commentsRef = collection(feedRef, 'comments');

    let targetUid = '';

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Get Feed Stats (READ FIRST)
            const feedDoc = await transaction.get(feedRef);

            // 2. Create Comment (WRITE)
            const newCommentRef = doc(commentsRef); // Auto-ID
            transaction.set(newCommentRef, commentData);

            // 3. Update Feed Stats (WRITE)
            if (feedDoc.exists()) {
                const feedData = feedDoc.data();
                targetUid = feedData.author?.uid; // Capture author UID

                const currentComments = feedData.stats?.comments || 0;
                transaction.update(feedRef, {
                    'stats.comments': currentComments + 1
                });
            }
        });

        // Send Notification
        // 1. Reply Notification (Priority) - Notify the user being replied to
        if (parentId && replyToUser && replyToUser.uid !== user.uid) {
            await sendNotification(replyToUser.uid, 'reply', user, feedId);
        }
        // 2. Comment Notification - Notify post author if not self and not already notified by reply
        else if (targetUid && targetUid !== user.uid) {
            await sendNotification(targetUid, 'comment', user, feedId);
        }

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
}


export function subscribeToComments(feedId: string, callback: (comments: Comment[]) => void) {
    const q = query(
        collection(db, 'global_lounge_feed', feedId, 'comments'),
        orderBy('createdAt', 'asc'), // Oldest first
        limit(100)
    );

    return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Comment[];
        callback(comments);
    });
}

export async function deleteComment(feedId: string, commentId: string) {
    const feedRef = doc(db, 'global_lounge_feed', feedId);
    const commentRef = doc(feedRef, 'comments', commentId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Delete Comment
            transaction.delete(commentRef);

            // 2. Update Feed Stats
            const feedDoc = await transaction.get(feedRef);
            if (feedDoc.exists()) {
                const currentComments = feedDoc.data().stats?.comments || 0;
                transaction.update(feedRef, {
                    'stats.comments': Math.max(0, currentComments - 1)
                });
            }
        });
    } catch (e) {
        console.error("Failed to delete comment:", e);
        throw e;
    }
}


// --- Notification Operations ---

export async function sendNotification(
    targetUid: string,
    type: 'like' | 'comment' | 'reply' | 'mention',
    fromUser: UserProfile,
    feedId: string
) {
    // Don't notify self
    if (targetUid === fromUser.uid) return;

    // Optional: Check duplication for likes to avoid spam
    if (type === 'like') {
        const q = query(
            collection(db, 'users', targetUid, 'notifications'),
            where('type', '==', 'like'),
            where('feedId', '==', feedId),
            where('fromUser.uid', '==', fromUser.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return; // Already notified
    }

    await addDoc(collection(db, 'users', targetUid, 'notifications'), {
        type,
        fromUser: {
            uid: fromUser.uid,
            name: fromUser.displayName || 'Unknown',
            avatar: fromUser.photoURL || ''
        },
        feedId,
        isRead: false,
        createdAt: serverTimestamp()
    });
}

export function subscribeToNotifications(uid: string, callback: (notifications: Notification[]) => void, onError?: (error: any) => void) {
    const q = query(
        collection(db, 'users', uid, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(20)
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Notification[];
        callback(notifications);
    }, (error) => {
        if (onError) {
            onError(error);
        } else {
            console.error("Notification subscription error:", error);
        }
    });
}

export async function markNotificationAsRead(uid: string, notificationId: string) {
    await updateDoc(doc(db, 'users', uid, 'notifications', notificationId), {
        isRead: true
    });
}

export async function markAllNotificationsAsRead(uid: string) {
    const q = query(collection(db, 'users', uid, 'notifications'), where('isRead', '==', false));
    const snapshot = await getDocs(q);
    const batch = (await import('firebase/firestore')).writeBatch(db);

    snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
}

// --- Report Types ---
export interface Report {
    id: string;
    targetId: string;
    targetType: 'feed' | 'comment';
    reason: string;
    description?: string;
    reportedBy: {
        uid: string;
        name: string;
    };
    reportedUser?: {
        uid: string;
        name: string;
    } | null;
    status: 'pending' | 'resolved' | 'dismissed';
    resolution?: 'deleted' | 'banned' | 'dismissed';
    createdAt: Timestamp;
}

// --- Report Operations ---

export async function addReport(
    targetId: string,
    targetType: 'feed' | 'comment',
    reason: string,
    description: string,
    reporter: UserProfile,
    reportedUser: { uid: string, name: string } | null
) {
    await addDoc(collection(db, 'reports'), {
        targetId,
        targetType,
        reason,
        description,
        reportedBy: {
            uid: reporter.uid,
            name: reporter.displayName || 'Unknown'
        },
        reportedUser: reportedUser || null,
        status: 'pending',
        createdAt: serverTimestamp()
    });
}

export async function getReports(status: 'pending' | 'resolved' | 'dismissed' = 'pending') {
    const q = query(
        collection(db, 'reports'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
}

export async function resolveReport(
    reportId: string,
    action: 'delete' | 'ban' | 'dismiss',
    targetId: string,
    targetType: 'feed' | 'comment'
) {
    const reportRef = doc(db, 'reports', reportId);

    try {
        await runTransaction(db, async (transaction) => {
            // 1. Update Report Status
            transaction.update(reportRef, {
                status: action === 'dismiss' ? 'dismissed' : 'resolved',
                resolution: action === 'dismiss' ? 'dismissed' : (action === 'ban' ? 'banned' : 'deleted')
            });

            // 2. Perform Action
            if (action === 'delete') {
                if (targetType === 'feed') {
                    transaction.delete(doc(db, 'global_lounge_feed', targetId));
                }
            } else if (action === 'ban') {
                const reportDoc = await transaction.get(reportRef);
                const reportData = reportDoc.data() as Report;
                if (reportData.reportedUser?.uid) {
                    transaction.update(doc(db, 'users', reportData.reportedUser.uid), {
                        isBanned: true
                    });
                }
            }
        });
    } catch (e) {
        console.error("Failed to resolve report:", e);
        throw e;
    }
}
