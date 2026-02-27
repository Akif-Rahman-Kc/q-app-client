import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Imported offline full Quran text
import quranEnglish from '../../assets/data/quran-en.json';
import quranUthmani from '../../assets/data/quran-uthmani.json';

interface JuzSurahGroup {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahsArabic: any[];
    ayahsEnglish: any[];
}

export default function JuzScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [juzGroups, setJuzGroups] = useState<JuzSurahGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('Reading'); // 'Reading' | 'Translation'

    // Helper to robustly strip Bismillah from Ayah 1 of Surahs (except Al-Fatihah)
    const removeBismillah = (text: string, surahId: string) => {
        if (surahId === '1') return text;
        const bismillah1 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
        const bismillah2 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
        const bismillah3 = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَنِ ٱلرَّحِيمِ';
        let cleaned = text.replace('\uFEFF', ''); // Remove BOM if present
        if (cleaned.startsWith(bismillah1)) cleaned = cleaned.replace(bismillah1, '');
        else if (cleaned.startsWith(bismillah2)) cleaned = cleaned.replace(bismillah2, '');
        else if (cleaned.startsWith(bismillah3)) cleaned = cleaned.replace(bismillah3, '');
        return cleaned.trim();
    };

    const getJuzReadingText = (group: JuzSurahGroup) => {
        if (!group || !group.ayahsArabic) return '';
        return group.ayahsArabic.map((ayah: any) => {
            const cleanText = (ayah.numberInSurah === 1)
                ? removeBismillah(ayah.text, group.surahNumber.toString())
                : ayah.text;
            const arabicNumber = ayah.numberInSurah
                .toString()
                .replace(/\d/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
            return `${cleanText} ۝${arabicNumber}  `;
        }).join('');
    };

    useEffect(() => {
        if (!id) return;

        const targetJuz = parseInt(id as string, 10);
        const groups: JuzSurahGroup[] = [];

        // Iterate through all surahs to find ayahs belonging to this juz
        for (let i = 0; i < quranUthmani.surahs.length; i++) {
            const surahAr = quranUthmani.surahs[i];
            const surahEn = quranEnglish.surahs[i];

            const ayahsInJuzAr = surahAr.ayahs.filter((a: any) => a.juz === targetJuz);
            const ayahsInJuzEn = surahEn.ayahs.filter((a: any) => a.juz === targetJuz);

            if (ayahsInJuzAr.length > 0) {
                groups.push({
                    surahNumber: surahAr.number,
                    surahName: surahAr.name,
                    surahEnglishName: surahAr.englishName,
                    ayahsArabic: ayahsInJuzAr,
                    ayahsEnglish: ayahsInJuzEn
                });
            }
        }

        setJuzGroups(groups);
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 bg-[#050f05] items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (juzGroups.length === 0) {
        return (
            <View className="flex-1 bg-[#050f05] items-center justify-center">
                <Text className="text-white text-lg">Juz not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#10b981] px-6 py-2 rounded-full">
                    <Text className="text-[#050f05] font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#050f05]">
            <StatusBar barStyle="light-content" backgroundColor="#050f05" />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-7">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-xl">Juz {id}</Text>
                    <Text className="text-gray-400 text-xs text-center" numberOfLines={1}>
                        {juzGroups.map(g => g.surahEnglishName).join(', ')}
                    </Text>
                </View>
                <View className="w-11" />
            </View>

            {/* View Mode Switcher */}
            <View className="px-16 py-2 border-b border-[#142114]">
                <View className="flex-row bg-[#142114] p-1 rounded-xl">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setViewMode('Reading')}
                        className="flex-1 py-1.5 rounded-lg"
                        style={{ backgroundColor: viewMode === 'Reading' ? '#10b981' : 'transparent' }}
                    >
                        <Text
                            className="text-center font-bold text-sm"
                            style={{ color: viewMode === 'Reading' ? '#050f05' : '#9ca3af' }}
                        >
                            Reading
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setViewMode('Translation')}
                        className="flex-1 py-1.5 rounded-lg"
                        style={{ backgroundColor: viewMode === 'Translation' ? '#10b981' : 'transparent' }}
                    >
                        <Text
                            className="text-center font-bold text-sm"
                            style={{ color: viewMode === 'Translation' ? '#050f05' : '#9ca3af' }}
                        >
                            Translation
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Ayahs Content */}
            <ScrollView className="flex-1 px-4 mt-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {juzGroups.map((group, groupIndex) => (
                    <View key={`surah-${group.surahNumber}`} className="mb-8">

                        {/* Surah Header for this Juz portion */}
                        <View className="items-center justify-center py-6 mb-4">
                            <Text className="text-[#10b981] text-2xl font-bold" style={{ fontFamily: 'System' }}>
                                سُورَةُ {group.surahEnglishName}
                            </Text>
                        </View>

                        {/* Translation Mode */}
                        {viewMode === 'Translation' && group.ayahsArabic.map((ayahAr: any, idx: number) => {
                            const ayahEn = group.ayahsEnglish[idx];
                            // Apply helper to remove bismillah specifically from ayah 1 (unless Fatihah)
                            const cleanText = (ayahAr.numberInSurah === 1)
                                ? removeBismillah(ayahAr.text, group.surahNumber.toString())
                                : ayahAr.text;

                            return (
                                <View key={ayahAr.numberInSurah} className="mb-8 border-b border-[#142114] pb-6">
                                    {/* Actions Bar for Ayah */}
                                    <View className="flex-row items-center justify-between bg-[#142114] px-4 py-2 rounded-xl mb-4">
                                        <View className="bg-[#10b981] w-8 h-8 rounded-full items-center justify-center">
                                            <Text className="text-[#050f05] font-bold text-sm">{ayahAr.numberInSurah}</Text>
                                        </View>
                                        <View className="flex-row space-x-6">
                                            <TouchableOpacity>
                                                <Share2 size={20} color="#10b981" />
                                            </TouchableOpacity>
                                            <View className="w-4" />
                                            <TouchableOpacity>
                                                <Bookmark size={20} color="#10b981" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Arabic Text (Uthmani) */}
                                    <Text
                                        className="text-white text-3xl leading-[55px] text-right mb-6"
                                        style={{ fontFamily: 'System' }}
                                    >
                                        {cleanText}
                                    </Text>

                                    {/* English Translation */}
                                    <Text className="text-gray-300 text-lg leading-7">
                                        {ayahEn.text}
                                    </Text>
                                </View>
                            );
                        })}

                        {/* Reading Mode */}
                        {viewMode === 'Reading' && (
                            <View className="mb-8 px-2 pb-12">
                                <Text
                                    className="text-white text-[28px] leading-[60px] text-justify"
                                    style={{ fontFamily: 'System', writingDirection: 'rtl' }}
                                >
                                    {getJuzReadingText(group)}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}
