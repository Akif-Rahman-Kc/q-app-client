import adkarData from '@/assets/data/adkar.json';
import { getAdkarFavorites, toggleAdkarFavorite } from '@/utils/adkar-favorites';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, Star, StarOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

const data = adkarData as any;

export default function AdkarFavoritesScreen() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml');

    useFocusEffect(
        React.useCallback(() => {
            const loadFavorites = async () => {
                setLoading(true);
                try {
                    const savedFavorites = await getAdkarFavorites();
                    savedFavorites.sort((a, b) => b.addedAt - a.addedAt);

                    const enrichedFavorites = savedFavorites.map(fav => {
                        const categoryData = data[fav.category] as any[];
                        if (!categoryData) return null;

                        const itemData = categoryData.find(item => item.id === fav.id);
                        if (!itemData) return null;

                        return {
                            ...itemData,
                            _categoryKey: fav.category // Use meta-property to track source
                        };
                    }).filter(Boolean);

                    setFavorites(enrichedFavorites);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            loadFavorites();
        }, [])
    );

    const handleToggleFavorite = async (category: string, id: number) => {
        await toggleAdkarFavorite(category, id);
        // Remove from list immediately
        setFavorites(prev => prev.filter(item => !(item._categoryKey === category && item.id === id)));
    };

    const CATEGORY_TITLES: Record<string, string> = {
        sabah: 'Adkar Al-Sabah',
        masa: "Adkar Al-Masa'",
        after_prayer: 'After Prayer',
        prayer: 'Prayer & Wudu',
        daily: 'Daily Life',
        sleep: 'Sleep & Waking Up',
        nature: 'Nature & Weather',
        travel: 'Travel',
        sick: 'Sick & Hardship',
        funeral: 'Funeral & Graves',
    };

    return (
        <LinearGradient
            colors={['#0a0f0a', '#0f1a14', '#0a0f0a']}
            style={{ flex: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-xl">Favorite Adkars</Text>
                    <Text className="text-[#10b981] text-xs font-semibold">{favorites.length} Saved Items</Text>
                </View>
                <View className="w-11" />
            </View>

            {/* Language Toggle */}
            {!loading && favorites.length > 0 && (
                <View className="flex-row justify-center py-3 border-b border-[#142114] space-x-4">
                    <Pressable
                        onPress={() => setTranslationLanguage('ml')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'ml' ? 'border-[#10b981] bg-[#10b98120]' : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'ml' ? '#10b981' : '#6b7280' }}>Malayalam</Text>
                    </Pressable>
                    <View className="w-2" />
                    <Pressable
                        onPress={() => setTranslationLanguage('en')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'en' ? 'border-[#10b981] bg-[#10b98120]' : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'en' ? '#10b981' : '#6b7280' }}>English</Text>
                    </Pressable>
                </View>
            )}

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : favorites.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-24 h-24 bg-[#142114] rounded-full items-center justify-center mb-6 border border-[#2d3a2d]">
                        <StarOff size={40} color="#10b981" strokeWidth={1.5} />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2 text-center">No Favorites Yet</Text>
                    <Text className="text-gray-400 text-center leading-6">
                        Read Adkar and tap the star icon to save them here for quick access later.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-8 bg-[#10b981] px-8 py-3 rounded-[20px]"
                    >
                        <Text className="text-[#050f05] font-bold text-[15px]">Return to Categories</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                    {favorites.map((adkar, index) => {
                        const displayTitle = CATEGORY_TITLES[adkar._categoryKey] || (adkar._categoryKey.charAt(0).toUpperCase() + adkar._categoryKey.slice(1));

                        return (
                            <View
                                key={`${adkar._categoryKey}-${adkar.id}`}
                                className="mb-6 bg-[#0d1a0d] border border-[#1a2e1a] rounded-3xl shadow-sm overflow-hidden"
                            >
                                {/* Card Header */}
                                <View className="flex-row justify-between items-center px-4 py-3 bg-[#112411] border-b border-[#1a2e1a]">
                                    <View className="flex-row items-center">
                                        <Text className="text-[#ffffff] text-md font-semibold mr-2 px-3 py-1 bg-[#1a2e1a] rounded-md">{displayTitle}</Text>
                                        <Text className="text-[#9ca3af] text-xs flex-shrink" numberOfLines={1}>{adkar.reference || adkar.en_reference}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleToggleFavorite(adkar._categoryKey, adkar.id)}
                                        className="p-2"
                                    >
                                        <Star size={22} color="#facc15" fill="#facc15" />
                                    </TouchableOpacity>
                                </View>

                                {/* Arabic Text */}
                                <View className="p-5 pb-4">
                                    <Text
                                        className="text-white text-[24px] leading-[45px] font-bold text-right mb-4"
                                        style={{ fontFamily: 'System' }}
                                    >
                                        {adkar.arabic}
                                    </Text>
                                </View>

                                {/* Translated Content */}
                                <View style={{ paddingHorizontal: 18, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#1a2e1a', paddingTop: 14 }}>
                                    {(adkar.en_transliteration || adkar.ml_transliteration) && (
                                        <>
                                            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLITERATION</Text>
                                            <Text style={{ color: '#6ee7b7', fontSize: 14, fontStyle: 'italic', marginBottom: 12, lineHeight: 22 }}>
                                                {translationLanguage === 'ml' ? (adkar.ml_transliteration || adkar.en_transliteration) : adkar.en_transliteration}
                                            </Text>
                                        </>
                                    )}

                                    <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLATION</Text>
                                    <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 24, marginBottom: (adkar.en_benefit || adkar.benefit) ? 12 : 4 }}>
                                        {translationLanguage === 'ml'
                                            ? (adkar.ml_translation || adkar.translation)
                                            : (adkar.en_translation || adkar.translation)}
                                    </Text>

                                    {(adkar.en_benefit || adkar.benefit) && (
                                        <View style={{ backgroundColor: '#0a1a0f', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#10b981' }}>
                                            <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '800', marginBottom: 4, letterSpacing: 1 }}>BENEFIT</Text>
                                            <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 20 }}>
                                                {translationLanguage === 'ml' ? (adkar.ml_benefit || adkar.benefit) : (adkar.en_benefit || adkar.benefit)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            )}
        </LinearGradient>
    );
}
