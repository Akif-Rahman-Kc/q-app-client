import AsyncStorage from '@react-native-async-storage/async-storage';

const ADKAR_FAVORITES_KEY = 'adkar_favorites';

export interface AdkarFavoriteItem {
    category: string;
    id: number;
    addedAt: number;
}

export const getAdkarFavorites = async (): Promise<AdkarFavoriteItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(ADKAR_FAVORITES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Error reading adkar favorites', e);
        return [];
    }
};

export const toggleAdkarFavorite = async (category: string, id: number): Promise<boolean> => {
    try {
        const currentFavorites = await getAdkarFavorites();
        const existingIndex = currentFavorites.findIndex(fav => fav.category === category && fav.id === id);

        if (existingIndex > -1) {
            // Remove it
            currentFavorites.splice(existingIndex, 1);
            await AsyncStorage.setItem(ADKAR_FAVORITES_KEY, JSON.stringify(currentFavorites));
            return false; // Now unfavorited
        } else {
            // Add it
            currentFavorites.push({ category, id, addedAt: Date.now() });
            await AsyncStorage.setItem(ADKAR_FAVORITES_KEY, JSON.stringify(currentFavorites));
            return true; // Now favorited
        }
    } catch (e) {
        console.error('Error toggling adkar favorite', e);
        return false;
    }
};
