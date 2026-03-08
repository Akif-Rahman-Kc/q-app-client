import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import adkarData from '../assets/data/adkar.json';
import { getLastRead } from './bookmarks';

const sabahTotal = (adkarData as any).sabah?.length || 0;
const masaTotal = (adkarData as any).masa?.length || 0;
const totalDailyAdkars = sabahTotal + masaTotal;

const STATS_STORAGE_KEY = '@quran_profile_stats_v1';

// Generic type for counting daily metrics (minutes/verses)
export interface DailyCount {
    date: string; // YYYY-MM-DD
    count: number;
}

export interface Challenge {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    progress: number; // 0-100
    targetProgress?: number; // 0-100 (Expected progress based on days passed)
    progressText: string;
    color: string;
    targetVal: number;
    currentVal: number;
    type: 'quran_pages' | 'adkar_count' | 'streak_days';
    durationDays: number;
    startDate: string; // YYYY-MM-DD
    status: 'ongoing' | 'success' | 'failed';
}

export interface ProfileStats {
    streakDays: number;
    lastActiveDate: string | null;
    appUsageHistory: DailyCount[]; // Minutes open in the app
    quranTimeHistory: DailyCount[]; // Minutes reading the Quran
    challenges: Challenge[];
    joinedDate: string;
    dailyAdkarLog: {
        date: string;
        sabah: boolean;
        masa: boolean;
        sabahCounts: Record<number, number>;
        masaCounts: Record<number, number>;
    };
}

const DEFAULT_CHALLENGES: Challenge[] = [];

const DEFAULT_STATS: ProfileStats = {
    streakDays: 0,
    lastActiveDate: null,
    appUsageHistory: [],
    quranTimeHistory: [],
    challenges: DEFAULT_CHALLENGES,
    joinedDate: dayjs().toISOString(),
    dailyAdkarLog: {
        date: dayjs().format('YYYY-MM-DD'),
        sabah: false,
        masa: false,
        sabahCounts: {},
        masaCounts: {}
    }
};

export const getProfileStats = async (): Promise<ProfileStats> => {
    try {
        const data = await AsyncStorage.getItem(STATS_STORAGE_KEY);
        let currentStats = DEFAULT_STATS;
        if (data) {
            const parsed = JSON.parse(data) as ProfileStats;
            // Merge defaults (in case we added new fields to the interface later)
            currentStats = {
                ...DEFAULT_STATS,
                ...parsed,
                challenges: parsed.challenges || DEFAULT_CHALLENGES,
                dailyAdkarLog: parsed.dailyAdkarLog || DEFAULT_STATS.dailyAdkarLog
            };
        }

        // Evaluate challenges on every fetch
        const evaluated = evaluateChallenges(currentStats);

        // If a day rolled over and CurrentVal was permanently incremented by evaluateChallenges, 
        // we MUST save it here so it doesn't get wiped by the subsequent date reset in getDailyAdkarCounts.
        if (JSON.stringify(currentStats.challenges) !== JSON.stringify(evaluated.challenges)) {
            await saveProfileStats(evaluated);
        }

        return evaluated;
    } catch (e) {
        console.error('Error fetching profile stats', e);
        return DEFAULT_STATS;
    }
};

const evaluateChallenges = (stats: ProfileStats): ProfileStats => {
    const today = dayjs().format('YYYY-MM-DD');

    stats.challenges = stats.challenges.map(challenge => {
        if (challenge.status !== 'ongoing') return challenge;

        const start = dayjs(challenge.startDate);
        const diffDays = dayjs(today).diff(start, 'day');
        const remainingDays = Math.max(0, challenge.durationDays - diffDays);

        let newStatus: 'ongoing' | 'success' | 'failed' = challenge.status;
        let newBadge = remainingDays > 0 ? `${remainingDays} Days Left` : '0 Days Left';

        if (remainingDays === 0) {
            // Check if success or fail
            if (challenge.currentVal >= challenge.targetVal) {
                newStatus = 'success';
                newBadge = 'Success';
            } else {
                newStatus = 'failed';
                newBadge = 'Failed';
            }
        }

        let dynamicProgress = challenge.progress;

        if (challenge.type === 'adkar_count' && newStatus === 'ongoing') {
            const sabahCompleted = Object.values(stats.dailyAdkarLog.sabahCounts || {}).filter(c => c === 0).length;
            const masaCompleted = Object.values(stats.dailyAdkarLog.masaCounts || {}).filter(c => c === 0).length;
            const totalCompletedToday = sabahCompleted + masaCompleted;

            let todayFraction = 0;

            // If the day rolled over and yesterday was 100% completed, bake it into currentVal
            if (stats.dailyAdkarLog.date !== today && stats.dailyAdkarLog.sabah && stats.dailyAdkarLog.masa) {
                challenge.currentVal = Math.min(challenge.currentVal + 1, challenge.targetVal);
            }

            if (stats.dailyAdkarLog.date === today && totalCompletedToday > 0) {
                todayFraction = totalDailyAdkars > 0 ? (totalCompletedToday / totalDailyAdkars) : 0;
            }

            dynamicProgress = Math.min(100, Math.round(((challenge.currentVal + todayFraction) / challenge.targetVal) * 100));
        }

        let progressText = challenge.progressText;
        if (challenge.type === 'adkar_count' && newStatus === 'ongoing') {
            // Recalculate the floor value for the text visually
            const safeCurrentVal = Math.min(challenge.currentVal, challenge.targetVal);
            progressText = `${safeCurrentVal} out of ${challenge.targetVal} logged`;
        }

        const daysElapsed = dayjs().diff(dayjs(challenge.startDate), 'day') + 1;
        const targetProgress = Math.min(100, Math.round((daysElapsed / challenge.durationDays) * 100));

        return {
            ...challenge,
            badge: newBadge,
            status: newStatus,
            progress: challenge.type === 'adkar_count' ? dynamicProgress : challenge.progress,
            targetProgress,
            progressText
        };
    });

    return stats;
};

const saveProfileStats = async (stats: ProfileStats) => {
    try {
        await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('Error saving profile stats', e);
    }
};

// Call this on app load or main tab focus
export const checkAndUpdateStreak = async () => {
    const stats = await getProfileStats();
    const today = dayjs().format('YYYY-MM-DD');

    if (!stats.lastActiveDate) {
        // First time opening the app!
        stats.streakDays = 1;
        stats.lastActiveDate = today;
        await saveProfileStats(stats);
        return;
    }

    const lastActive = dayjs(stats.lastActiveDate);
    const diffDays = dayjs(today).diff(lastActive, 'day');

    if (diffDays === 1) {
        // Consecutive day
        stats.streakDays += 1;
        stats.lastActiveDate = today;
    } else if (diffDays > 1) {
        // Streak broken
        stats.streakDays = 1;
        stats.lastActiveDate = today;
    }
    // If diffDays === 0, they already opened the app today. Do nothing.

    await saveProfileStats(stats);
};

// Call this when unmounting a Surah or Juz reading view
export const addQuranReadingSession = async (minutes: number) => {
    const stats = await getProfileStats();
    const today = dayjs().format('YYYY-MM-DD');

    // Update verse history (for chart)
    const todayEntryIndex = stats.quranTimeHistory.findIndex(h => h.date === today);
    if (todayEntryIndex >= 0) {
        stats.quranTimeHistory[todayEntryIndex].count += minutes;
    } else {
        stats.quranTimeHistory.push({ date: today, count: minutes });
    }

    // Keep only last 7 days of history to limit storage size
    if (stats.quranTimeHistory.length > 7) {
        stats.quranTimeHistory = stats.quranTimeHistory.slice(-7);
    }

    await saveProfileStats(stats);
};

export const recordAppUsageSession = async (minutes: number) => {
    if (minutes <= 0) return;
    const stats = await getProfileStats();
    const today = dayjs().format('YYYY-MM-DD');

    const todayEntryIndex = stats.appUsageHistory.findIndex(h => h.date === today);
    if (todayEntryIndex >= 0) {
        stats.appUsageHistory[todayEntryIndex].count += minutes;
    } else {
        stats.appUsageHistory.push({ date: today, count: minutes });
    }

    if (stats.appUsageHistory.length > 7) {
        stats.appUsageHistory = stats.appUsageHistory.slice(-7);
    }

    await saveProfileStats(stats);
};

export const syncQuranChallengeProgress = async () => {
    const stats = await getProfileStats();
    const lastRead = await getLastRead();
    if (!lastRead) return;

    let updated = false;
    stats.challenges = stats.challenges.map(challenge => {
        if (challenge.type === 'quran_pages' && challenge.status === 'ongoing') {
            updated = true;
            const surahNum = lastRead.surahNumber;
            // The challenge current value is just how far they have gotten (Surah number)
            const newVal = Math.min(surahNum, challenge.targetVal);

            // Progress percentage is how close the Surah Number is to their Target Goal (e.g. 51 / 114 = 44%)
            const progress = challenge.targetVal > 0
                ? Math.min(100, Math.round((newVal / challenge.targetVal) * 100))
                : 0;

            return {
                ...challenge,
                currentVal: newVal,
                progress,
                progressText: `Surah ${lastRead.surahEnglishName}`
            };
        }
        return challenge;
    });

    if (updated) {
        await saveProfileStats(stats);
    }
};

// Load the specific counts for the day, returning initial defaults if it's a new day
export const getDailyAdkarCounts = async (type: 'sabah' | 'masa', initialCounts: Record<number, number>): Promise<Record<number, number>> => {
    const stats = await getProfileStats();
    const today = dayjs().format('YYYY-MM-DD');

    // If it's a new day, return the fresh defaults
    if (stats.dailyAdkarLog.date !== today) {
        return initialCounts;
    }

    // Merge the saved counts with the initial defaults. 
    // This handles if new Adkars were added to the JSON data since the last save.
    const savedCounts = type === 'sabah' ? stats.dailyAdkarLog.sabahCounts : stats.dailyAdkarLog.masaCounts;
    return { ...initialCounts, ...savedCounts };
};

// Save progress dynamically as the user taps
export const saveDailyAdkarProgress = async (type: 'sabah' | 'masa', counts: Record<number, number>, isFullyCompleted: boolean) => {
    const stats = await getProfileStats();
    const today = dayjs().format('YYYY-MM-DD');

    // Reset daily log if it's a new day (safety check)
    if (stats.dailyAdkarLog.date !== today) {
        stats.dailyAdkarLog = {
            date: today,
            sabah: false,
            masa: false,
            sabahCounts: {},
            masaCounts: {}
        };
    }

    // Save the granular dictionary of counts
    if (type === 'sabah') {
        stats.dailyAdkarLog.sabahCounts = counts;
    } else {
        stats.dailyAdkarLog.masaCounts = counts;
    }

    // Set to true or false exactly matching the screen layout
    stats.dailyAdkarLog[type] = isFullyCompleted;

    // Always re-evaluate so progress/fraction is visually accurate and saved immediately
    const evaluatedStats = evaluateChallenges(stats);

    await saveProfileStats(evaluatedStats);
};

// Add a custom user-defined challenge
export const addCustomChallenge = async (
    challengeInput: Omit<Challenge, 'id' | 'progress' | 'currentVal' | 'progressText'>
) => {
    const stats = await getProfileStats();

    // Limit to 1 active challenge per type by throwing an error if one already exists
    const existingActive = stats.challenges.find(c => c.type === challengeInput.type && c.status === 'ongoing');
    if (existingActive) {
        throw new Error(`You already have an active ${challengeInput.type === 'quran_pages' ? 'Quran' : 'Adkar'} goal. Please complete or delete it first.`);
    }

    // For Quran, the target is ALWAYS 114 full Surahs since we track progress by the last read Surah number.
    // The user's input "targetVal" in the UI is actually meant to be their Duration in Days. 
    const isQuran = challengeInput.type === 'quran_pages';
    const trueTarget = isQuran ? 114 : challengeInput.targetVal;

    const newChallenge: Challenge = {
        ...challengeInput,
        targetVal: trueTarget, // override any weird input for Quran
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        currentVal: 0,
        progress: 0,
        progressText: `0 / ${trueTarget} ${isQuran ? 'Surahs' : 'Days'}`
    };

    stats.challenges.push(newChallenge);
    await saveProfileStats(stats);
    return newChallenge;
};

// Delete a specific challenge
export const deleteChallenge = async (id: string) => {
    const stats = await getProfileStats();
    stats.challenges = stats.challenges.filter(c => c.id !== id);
    await saveProfileStats(stats);
};

// Utility to completely reset profile data for testing or user choice
export const resetProfileStats = async () => {
    await AsyncStorage.removeItem(STATS_STORAGE_KEY);
    // Note: This does NOT delete @quran_profile_data (Username/Avatar), only the stats.
};
