import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@quran_bookmarks';

export interface BookmarkItem {
    surahNumber: number;
    ayahNumber: number;
    addedAt: number;
}

export const getBookmarks = async (): Promise<BookmarkItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(BOOKMARKS_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Failed to get bookmarks', e);
        return [];
    }
};

export const addBookmark = async (surahNumber: number, ayahNumber: number): Promise<void> => {
    try {
        const bookmarks = await getBookmarks();
        const exists = bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
        if (!exists) {
            bookmarks.push({ surahNumber, ayahNumber, addedAt: Date.now() });
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
        }
    } catch (e) {
        console.error('Failed to add bookmark', e);
    }
};

export const removeBookmark = async (surahNumber: number, ayahNumber: number): Promise<void> => {
    try {
        const bookmarks = await getBookmarks();
        const updated = bookmarks.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber));
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to remove bookmark', e);
    }
};

export const toggleBookmark = async (surahNumber: number, ayahNumber: number): Promise<boolean> => {
    try {
        const bookmarks = await getBookmarks();
        const exists = bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);

        if (exists) {
            const updated = bookmarks.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber));
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
            return false;
        } else {
            bookmarks.push({ surahNumber, ayahNumber, addedAt: Date.now() });
            await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
            return true;
        }
    } catch (e) {
        console.error('Failed to toggle bookmark', e);
        return false;
    }
};

const LAST_READ_KEY = '@quran_last_read';

export interface LastReadItem {
    type: 'Surah' | 'Juz';
    id: string;
    surahNumber: number;
    ayahNumber: number;
    surahEnglishName: string;
    timestamp: number;
    viewMode?: 'Reading' | 'Translation';
}

export const getLastRead = async (): Promise<LastReadItem | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(LAST_READ_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Failed to get last read item', e);
        return null;
    }
};

export const setLastRead = async (type: 'Surah' | 'Juz', id: string, surahNumber: number, ayahNumber: number, surahEnglishName: string, viewMode?: 'Reading' | 'Translation'): Promise<void> => {
    try {
        const item: LastReadItem = {
            type,
            id,
            surahNumber,
            ayahNumber,
            surahEnglishName,
            timestamp: Date.now(),
            viewMode
        };
        await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(item));
    } catch (e) {
        console.error('Failed to set last read item', e);
    }
};
