import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Imported offline full Quran text
import quranEnglish from '../../assets/data/quran-en.json';
import quranUthmani from '../../assets/data/quran-uthmani.json';

export default function SurahScreen() {
    const { id, showAyahs } = useLocalSearchParams();
    const router = useRouter();

    const [surahArabic, setSurahArabic] = useState<any>(null);
    const [surahEnglish, setSurahEnglish] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(showAyahs ? 'Translation' : 'Reading'); // Default to Translation if viewing specific Ayahs

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

    const getReadingText = () => {
        if (!surahArabic) return '';

        const ayahsToRender = surahArabic.ayahs.filter((ayah: any) => {
            if (!showAyahs) return true;
            const targetAyahs = (showAyahs as string).split(',').map(Number);
            return targetAyahs.includes(ayah.numberInSurah);
        });

        return ayahsToRender.map((ayah: any) => {
            const cleanText = removeBismillah(ayah.text, id as string);
            const arabicNumber = ayah.numberInSurah
                .toString()
                .replace(/\d/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
            return `${cleanText} ۝${arabicNumber}  `;
        }).join('');
    };

    useEffect(() => {
        if (!id) return;

        // Find by Surah number within the fully localized uthmani data
        const arabicData = quranUthmani.surahs.find((s: any) => s.number.toString() === id.toString());
        const englishData = quranEnglish.surahs.find((s: any) => s.number.toString() === id.toString());

        if (arabicData && englishData) {
            setSurahArabic(arabicData);
            setSurahEnglish(englishData);
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 bg-[#050f05] items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    if (!surahArabic || !surahEnglish) {
        return (
            <View className="flex-1 bg-[#050f05] items-center justify-center">
                <Text className="text-white text-lg">Surah not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-[#10b981] px-6 py-2 rounded-full">
                    <Text className="text-[#050f05] font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#050f05] pt-7">
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114]">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-xl">{surahEnglish.englishName}</Text>
                    <Text className="text-gray-400 text-xs">{surahEnglish.englishNameTranslation}</Text>
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

            {/* Bismillah Header (Except Surah 1 and 9 typically, but Bismillah is part of data if applicable) */}
            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

                {(id !== '1' && id !== '9') ? (
                    <View className="items-center justify-center py-6 mb-4">
                        <Text className="text-[#10b981] text-3xl font-bold" style={{ fontFamily: 'System' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </Text>
                    </View>
                ) : null}

                {viewMode === 'Translation' ? (
                    (() => {
                        const ayahsToRender = surahArabic.ayahs.filter((ayah: any) => {
                            if (!showAyahs) return true;
                            const targetAyahs = (showAyahs as string).split(',').map(Number);
                            return targetAyahs.includes(ayah.numberInSurah);
                        });

                        return ayahsToRender.map((ayah: any, index: number) => {
                            const englishAyah = surahEnglish.ayahs.find((ea: any) => ea.numberInSurah === ayah.numberInSurah);

                            return (
                                <View key={ayah.numberInSurah} className="mb-8 border-b border-[#142114] pb-6">

                                    {/* Actions Bar for Ayah */}
                                    <View className="flex-row items-center justify-between bg-[#142114] px-4 py-2 rounded-xl mb-4">
                                        <View className="bg-[#10b981] w-8 h-8 rounded-full items-center justify-center">
                                            <Text className="text-[#050f05] font-bold text-sm">{ayah.numberInSurah}</Text>
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
                                        {removeBismillah(ayah.text, id as string)}
                                    </Text>

                                    {/* English Translation */}
                                    <Text className="text-gray-300 text-lg leading-7">
                                        {englishAyah?.text}
                                    </Text>
                                </View>
                            );
                        })
                    })()
                ) : (
                    <View className="mb-8 px-2 pb-12">
                        <Text
                            className="text-white text-[28px] leading-[60px] text-justify"
                            style={{ fontFamily: 'System', writingDirection: 'rtl' }}
                        >
                            {getReadingText()}
                        </Text>
                    </View>
                )}

                <View className="h-12" />
            </ScrollView >
        </View >
    );
}
