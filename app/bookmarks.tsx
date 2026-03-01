import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Bookmark as BookmarkIcon, BookOpen, ChevronLeft, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

import quranEnglish from '../assets/data/quran-en.json';
import quranMalayalam from '../assets/data/quran-ml.json';
import quranUthmani from '../assets/data/quran-uthmani.json';
import { BookmarkItem, getBookmarks, removeBookmark } from '../utils/bookmarks';

export default function BookmarksScreen() {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<(BookmarkItem & { arabicText: string, englishText: string, malayalamText: string, surahEnglishName: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml'); // Default to Malayalam

    // Helper to robustly strip Bismillah
    const removeBismillah = (text: string, surahId: string) => {
        if (surahId === '1') return text;
        const bismillah1 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        const bismillah2 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
        const bismillah3 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ';
        let cleaned = text.replace('\uFEFF', '');
        if (cleaned.startsWith(bismillah1)) cleaned = cleaned.replace(bismillah1, '');
        else if (cleaned.startsWith(bismillah2)) cleaned = cleaned.replace(bismillah2, '');
        else if (cleaned.startsWith(bismillah3)) cleaned = cleaned.replace(bismillah3, '');
        return cleaned.trim();
    };

    useFocusEffect(
        React.useCallback(() => {
            const loadBookmarks = async () => {
                setLoading(true);
                try {
                    const savedBookmarks = await getBookmarks();

                    // Sort by addedAt descending (newest first)
                    savedBookmarks.sort((a, b) => b.addedAt - a.addedAt);

                    const enrichedBookmarks = savedBookmarks.map(b => {
                        const surahAr = quranUthmani.surahs.find((s: any) => s.number === b.surahNumber);
                        const surahEn = quranEnglish.surahs.find((s: any) => s.number === b.surahNumber);
                        const surahMl = quranMalayalam.surahs.find((s: any) => s.number === b.surahNumber);

                        let arabicText = '';
                        let englishText = '';
                        let malayalamText = '';
                        let surahEnglishName = surahEn?.englishName || `Surah ${b.surahNumber}`;

                        if (surahAr && surahEn && surahMl) {
                            const ayahAr = surahAr.ayahs.find((a: any) => a.numberInSurah === b.ayahNumber);
                            const ayahEn = surahEn.ayahs.find((a: any) => a.numberInSurah === b.ayahNumber);
                            const ayahMl = surahMl.ayahs.find((a: any) => a.numberInSurah === b.ayahNumber);

                            if (ayahAr) {
                                arabicText = b.ayahNumber === 1 ? removeBismillah(ayahAr.text, b.surahNumber.toString()) : ayahAr.text;
                            }
                            if (ayahEn) {
                                englishText = ayahEn.text;
                            }
                            if (ayahMl) {
                                malayalamText = ayahMl.text;
                            }
                        }

                        return {
                            ...b,
                            arabicText,
                            englishText,
                            malayalamText,
                            surahEnglishName
                        };
                    });

                    setBookmarks(enrichedBookmarks);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };

            loadBookmarks();
        }, [])
    );

    const handleRemoveBookmark = async (surahNumber: number, ayahNumber: number) => {
        await removeBookmark(surahNumber, ayahNumber);
        setBookmarks(prev => prev.filter(b => !(b.surahNumber === surahNumber && b.ayahNumber === ayahNumber)));
    };

    const navigateToAyah = (surahNumber: number, ayahNumber: number) => {
        router.push(`/surah/${surahNumber}?scrollToAyah=${ayahNumber}` as any);
    };

    return (
        <View className="flex-1 bg-[#050f05]">
            <StatusBar barStyle="light-content" backgroundColor="#050f05" />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-xl">Bookmarks</Text>
                    <Text className="text-[#10b981] text-xs font-semibold">{bookmarks.length} Saved Ayats</Text>
                </View>
                <View className="w-11" />
            </View>

            {/* Language Toggle for Bookmarks */}
            {!loading && bookmarks.length > 0 && (
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
            ) : bookmarks.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-24 h-24 bg-[#142114] rounded-full items-center justify-center mb-6 border border-[#2d3a2d]">
                        <BookmarkIcon size={40} color="#10b981" strokeWidth={1.5} />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2 text-center">No Bookmarks Yet</Text>
                    <Text className="text-gray-400 text-center leading-6">
                        Read the Quran and tap the bookmark icon on any Ayah to save it here for quick access later.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-8 bg-[#10b981] px-8 py-3 rounded-[20px]"
                    >
                        <Text className="text-[#050f05] font-bold text-[15px]">Return to Home</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                    {bookmarks.map((bookmark, index) => (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigateToAyah(bookmark.surahNumber, bookmark.ayahNumber)}
                            key={`${bookmark.surahNumber}-${bookmark.ayahNumber}`}
                            className="mb-6 bg-[#0a140a] border border-[#142114] rounded-2xl overflow-hidden"
                        >
                            {/* Action Header */}
                            <View className="flex-row items-center justify-between bg-[#142114] px-4 py-3 border-b border-[#1a2b1a]">
                                <View className="flex-row items-center">
                                    <View className="bg-[#10b98130] w-8 h-8 rounded-full items-center justify-center mr-3 border border-[#10b981]">
                                        <BookOpen size={14} color="#10b981" />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold">{bookmark.surahEnglishName}</Text>
                                        <Text className="text-[#10b981] text-[11px] font-semibold tracking-wider">Ayah {bookmark.ayahNumber}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleRemoveBookmark(bookmark.surahNumber, bookmark.ayahNumber)}
                                    className="p-2"
                                >
                                    <Trash2 size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View className="p-5">
                                <Text
                                    className="text-white text-[26px] leading-[45px] text-right mb-4"
                                    style={{ fontFamily: 'System' }}
                                >
                                    {bookmark.arabicText}
                                </Text>

                                <View className="h-[1px] bg-[#142114] mb-4" />

                                <Text className="text-gray-300 text-[15px] leading-6">
                                    {translationLanguage === 'ml' ? bookmark.malayalamText : bookmark.englishText}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
