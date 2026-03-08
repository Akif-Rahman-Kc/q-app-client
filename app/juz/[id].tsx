import CustomAlert from '@/components/CustomAlert';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, Moon, Share2, Sun } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, Share, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Imported offline full Quran text
import quranEnglish from '../../assets/data/quran-en.json';
import quranMalayalam from '../../assets/data/quran-ml.json';
import quranUthmani from '../../assets/data/quran-uthmani.json';
import { getBookmarks, getLastRead, setLastRead, toggleBookmark } from '../../utils/bookmarks';
import { addQuranReadingSession } from '../../utils/profile-stats';

interface JuzSurahGroup {
    surahNumber: number;
    surahName: string;
    surahEnglishName: string;
    ayahsArabic: any[];
    ayahsEnglish: any[];
    ayahsMalayalam: any[];
}

export default function JuzScreen() {
    const { id, scrollToAyah, showAyahs, viewMode: initialViewMode } = useLocalSearchParams();
    const [activeTargetAyah, setActiveTargetAyah] = useState<string | null>((scrollToAyah || showAyahs) as string);
    const router = useRouter();

    const scrollViewRef = React.useRef<ScrollView>(null);
    const ayahLayouts = React.useRef<{ [key: string]: number }>({});

    const [juzGroups, setJuzGroups] = useState<JuzSurahGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(initialViewMode ? (initialViewMode as string) : ((scrollToAyah || showAyahs) ? 'Translation' : 'Reading')); // Default to Translation if scrolling to Ayah
    const [startIndexGroup, setStartIndexGroup] = useState<number>(0);
    const [startIndexAyah, setStartIndexAyah] = useState<number>(0);
    const [isScrolled, setIsScrolled] = useState(false);
    const [readingTheme, setReadingTheme] = useState<'dark' | 'light'>('dark');
    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml'); // Default to Malayalam
    const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<string>>(new Set());
    const [lastReadAyahKey, setLastReadAyahKey] = useState<string | null>(null);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'delete' | 'warning';
        onConfirm: () => void;
        showCancel: boolean;
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { },
        showCancel: true
    });

    const showAlert = (config: Omit<typeof alertConfig, 'visible'>) => {
        setAlertConfig({ ...config, visible: true });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    useFocusEffect(
        React.useCallback(() => {
            if (!id) return;
            const loadData = async () => {
                const bookmarks = await getBookmarks();
                const bookmarksSet = new Set(bookmarks.map(b => `${b.surahNumber}-${b.ayahNumber}`));
                setBookmarkedAyahs(bookmarksSet);

                const lastRead = await getLastRead();
                if (lastRead && lastRead.type === 'Juz' && lastRead.id === id.toString()) {
                    setLastReadAyahKey(`${lastRead.surahNumber}-${lastRead.ayahNumber}`);
                } else {
                    setLastReadAyahKey(null);
                }
            };
            loadData();
        }, [id])
    );

    const handleBookmarkToggle = (surahNumber: number, ayahNumber: number) => {
        const key = `${surahNumber}-${ayahNumber}`;

        // Use setTimeout to allow TouchableOpacity's animation to finish
        setTimeout(async () => {
            setBookmarkedAyahs(prev => {
                const next = new Set(prev);
                if (next.has(key)) {
                    next.delete(key);
                } else {
                    next.add(key);
                }
                return next;
            });

            await toggleBookmark(surahNumber, ayahNumber);
        }, 50);
    };

    const promptSetLastRead = (surahNumber: number, ayahNumber: number, surahName: string) => {
        showAlert({
            title: "Mark Last Read",
            message: `Do you want to mark ${surahName} Ayah ${ayahNumber} as your last read point?`,
            type: 'success',
            onConfirm: async () => {
                hideAlert();
                await setLastRead('Juz', id as string, surahNumber, ayahNumber, surahName, viewMode as 'Reading' | 'Translation');
                setLastReadAyahKey(`${surahNumber}-${ayahNumber}`);
                setActiveTargetAyah(null);
            },
            showCancel: true
        });
    };

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

    const handleShareAyah = async (arabicText: string, englishText: string, surahName: string, surahNumber: number, ayahNumber: number) => {
        try {
            const message = `${arabicText}\n\n"${englishText}"\n\n— Quran ${surahName} ${surahNumber}:${ayahNumber}`;

            await Share.share({
                message,
                title: `Share Ayah ${surahNumber}:${ayahNumber}`
            });
        } catch (error: any) {
            console.error('Error sharing ayah:', error.message);
        }
    };

    const getJuzReadingText = (group: JuzSurahGroup, groupIndex: number) => {
        if (!group || !group.ayahsArabic) return '';

        let ayahsToRender = group.ayahsArabic;
        if (groupIndex === startIndexGroup) {
            ayahsToRender = group.ayahsArabic.slice(startIndexAyah);
        }

        return ayahsToRender.map((ayah: any) => {
            const cleanText = (ayah.numberInSurah === 1)
                ? removeBismillah(ayah.text, group.surahNumber.toString())
                : ayah.text;
            const arabicNumber = ayah.numberInSurah
                .toString()
                .replace(/\d/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
            const key = `${group.surahNumber}-${ayah.numberInSurah}`;
            const isTarget = activeTargetAyah === key;

            return (
                <Text
                    key={ayah.numberInSurah}
                    onLayout={(event) => {
                        if (isTarget) {
                            const y = event.nativeEvent.layout.y;
                            setTimeout(() => {
                                scrollViewRef.current?.scrollTo({ y, animated: true });
                            }, 250);
                        }
                    }}
                >
                    {cleanText}
                    <Text
                        onPress={() => promptSetLastRead(group.surahNumber, ayah.numberInSurah, group.surahEnglishName)}
                        className={lastReadAyahKey === key ? "text-[#10b981]" : isTarget ? "text-[#10b981]" : ""}
                        style={{ paddingHorizontal: 15, paddingVertical: 10 }}
                    >
                        {'  '}۝{arabicNumber}{'  '}
                    </Text>
                </Text>
            );
        });
    };

    useEffect(() => {
        if (!id) return;

        const targetJuz = parseInt(id as string, 10);
        const groups: JuzSurahGroup[] = [];

        // Iterate through all surahs to find ayahs belonging to this juz
        for (let i = 0; i < quranUthmani.surahs.length; i++) {
            const surahAr = quranUthmani.surahs[i];
            const surahEn = quranEnglish.surahs[i];
            const surahMl = quranMalayalam.surahs[i];

            const ayahsInJuzAr = surahAr.ayahs.filter((a: any) => a.juz === targetJuz);
            const ayahsInJuzEn = surahEn.ayahs.filter((a: any) => a.juz === targetJuz);
            const ayahsInJuzMl = surahMl.ayahs.filter((a: any) => a.juz === targetJuz);

            if (ayahsInJuzAr.length > 0) {
                groups.push({
                    surahNumber: surahAr.number,
                    surahName: surahAr.name,
                    surahEnglishName: surahAr.englishName,
                    ayahsArabic: ayahsInJuzAr,
                    ayahsEnglish: ayahsInJuzEn,
                    ayahsMalayalam: ayahsInJuzMl
                });
            }
        }

        if (scrollToAyah && !showAyahs) {
            // targetAyah format for Juz is 'surahNumber-ayahNumber'
            let foundGroupIndex = -1;
            let foundAyahIndex = -1;

            for (let g = 0; g < groups.length; g++) {
                const aIndex = groups[g].ayahsArabic.findIndex((a: any) => `${groups[g].surahNumber}-${a.numberInSurah}` === (scrollToAyah as string));
                if (aIndex > -1) {
                    foundGroupIndex = g;
                    foundAyahIndex = aIndex;
                    break;
                }
            }

            if (foundGroupIndex > -1) {
                setStartIndexGroup(foundGroupIndex);
                setStartIndexAyah(foundAyahIndex);
            }
        }

        setJuzGroups(groups);
        setJuzGroups(groups);
        setLoading(false);
    }, [id]);

    // Timer Logic using Focus State and App Backgrounding
    const sessionStartTime = useRef<number | null>(null);

    useFocusEffect(
        useCallback(() => {
            // Screen is focused
            sessionStartTime.current = Date.now();

            const subscription = AppState.addEventListener('change', nextAppState => {
                if (nextAppState === 'active') {
                    // Resumed
                    sessionStartTime.current = Date.now();
                } else if (nextAppState.match(/inactive|background/)) {
                    // Backgrounded
                    if (sessionStartTime.current && juzGroups.length > 0) {
                        const durationMs = Date.now() - sessionStartTime.current;
                        const durationMinutes = Math.floor(durationMs / 60000);
                        if (durationMinutes >= 1) {
                            addQuranReadingSession(durationMinutes).catch(console.error);
                        }
                    }
                }
            });

            return () => {
                // Screen is unfocused or unmounted
                subscription.remove();
                if (sessionStartTime.current && juzGroups.length > 0 && AppState.currentState === 'active') {
                    const durationMs = Date.now() - sessionStartTime.current;
                    const durationMinutes = Math.floor(durationMs / 60000);
                    if (durationMinutes >= 1) {
                        addQuranReadingSession(durationMinutes).catch(console.error);
                    }
                }
            };
        }, [juzGroups, id])
    );

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
                <Pressable onPress={() => router.back()} className="mt-4 bg-[#10b981] px-6 py-2 rounded-full" style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                    <Text className="text-[#050f05] font-bold">Go Back</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 pt-7 bg-[#050f05]">
            <StatusBar barStyle="light-content" />

            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-2">
                <Pressable onPress={() => router.back()} className="p-2 w-11" style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
                    <ChevronLeft size={28} color="white" />
                </Pressable>
                <View className="items-center flex-1">
                    <Text className="font-bold text-xl text-white">Juz {id}</Text>
                    <Text className="text-xs text-center text-gray-400" numberOfLines={1}>
                        {juzGroups.map(g => g.surahEnglishName).join(', ')}
                    </Text>
                </View>
                <Pressable
                    onPress={() => setReadingTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                    className="p-2 w-11 items-end"
                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                >
                    {readingTheme === 'dark' ? <Sun size={24} color="#10b981" /> : <Moon size={24} color="#059669" />}
                </Pressable>
            </View>

            {/* View Mode Switcher */}
            <View className="px-16 py-2 border-b border-[#142114]">
                <View className="flex-row p-1 rounded-xl bg-[#142114]">
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

                {/* Sub-toggle for Language if Translation mode is active */}
                {viewMode === 'Translation' && (
                    <View className="flex-row justify-center mt-4 mb-2 space-x-6">
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
            </View>

            {/* Ayahs Content */}
            <ScrollView ref={scrollViewRef} className={`flex-1 px-4 mt-4 ${readingTheme === 'dark' ? 'bg-[#050f05]' : 'bg-[#c3dbc8]'}`} contentContainerStyle={{ paddingBottom: 100 }}>
                {((startIndexGroup > 0 || startIndexAyah > 0) && !isScrolled) && (
                    <TouchableOpacity
                        onPress={() => { setStartIndexGroup(0); setStartIndexAyah(0); }}
                        className="items-center justify-center py-4 mb-6 rounded-2xl border"
                        style={{
                            backgroundColor: readingTheme === 'dark' ? '#142114' : '#ffffff',
                            borderColor: readingTheme === 'dark' ? '#2d3a2d' : '#e5e7eb',
                            shadowOpacity: readingTheme === 'dark' ? 0 : 0.05,
                            shadowRadius: 2,
                            shadowOffset: { width: 0, height: 1 },
                            elevation: readingTheme === 'dark' ? 0 : 1,
                        }}
                    >
                        <Text className={`font-bold ${readingTheme === 'dark' ? 'text-[#10b981]' : 'text-[#059669]'}`}>Load Beginning of Juz</Text>
                    </TouchableOpacity>
                )}

                {juzGroups.slice(startIndexGroup).map((group, slicedGroupIndex) => {
                    const actualGroupIndex = slicedGroupIndex + startIndexGroup;
                    let ayahsToRender = group.ayahsArabic;
                    let englishAyahsToRender = group.ayahsEnglish;
                    let malayalamAyahsToRender = group.ayahsMalayalam;

                    if (actualGroupIndex === startIndexGroup) {
                        ayahsToRender = group.ayahsArabic.slice(startIndexAyah);
                        englishAyahsToRender = group.ayahsEnglish.slice(startIndexAyah);
                        malayalamAyahsToRender = group.ayahsMalayalam.slice(startIndexAyah);
                    }

                    return (
                        <View key={`surah-${group.surahNumber}`} className="mb-8">

                            {/* Surah Header for this Juz portion */}
                            <View className="items-center justify-center py-6 mb-4">
                                <Text className={`text-2xl font-bold ${readingTheme === 'dark' ? 'text-[#10b981]' : 'text-[#059669]'}`} style={{ fontFamily: 'System' }}>
                                    سُورَةُ {group.surahEnglishName}
                                </Text>
                            </View>

                            {/* Translation Mode */}
                            {viewMode === 'Translation' && ayahsToRender.map((ayahAr: any, idx: number) => {
                                const ayahEn = englishAyahsToRender[idx];
                                const ayahMl = malayalamAyahsToRender[idx];

                                // Apply helper to remove bismillah specifically from ayah 1 (unless Fatihah)
                                const cleanText = (ayahAr.numberInSurah === 1)
                                    ? removeBismillah(ayahAr.text, group.surahNumber.toString())
                                    : ayahAr.text;

                                const displayTranslationText = translationLanguage === 'ml' ? ayahMl?.text : ayahEn?.text;

                                const themeActiveColor = readingTheme === 'dark' ? '#10b981' : '#059669';
                                const key = `${group.surahNumber}-${ayahAr.numberInSurah}`;
                                const isLastRead = lastReadAyahKey === key;
                                const isTarget = activeTargetAyah === key;

                                return (
                                    <View
                                        key={`${group.surahNumber}-${ayahAr.numberInSurah}`}
                                        className={`mb-8 border-b pb-6 ${readingTheme === 'dark' ? 'border-[#142114]' : 'border-gray-200'}`}
                                    >
                                        {/* Actions Bar for Ayah */}
                                        <View className={`flex-row items-center justify-between px-4 py-2 rounded-xl mb-4 ${readingTheme === 'dark' ? 'bg-[#142114]' : 'bg-gray-100'}`}>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    promptSetLastRead(group.surahNumber, ayahAr.numberInSurah, group.surahEnglishName);
                                                    setActiveTargetAyah(null);
                                                }}
                                                className={`w-8 h-8 rounded-full items-center justify-center ${readingTheme === 'dark' ? 'bg-[#10b981]' : 'bg-[#059669]'}`}>
                                                <Text className={`font-bold text-sm ${readingTheme === 'dark' ? 'text-[#050f05]' : 'text-white'}`}>{ayahAr.numberInSurah}</Text>
                                            </TouchableOpacity>
                                            <View className="flex-row space-x-6">
                                                <Pressable
                                                    onPress={() => handleShareAyah(cleanText, displayTranslationText, group.surahEnglishName, group.surahNumber, ayahAr.numberInSurah)}
                                                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                                                >
                                                    <Share2 size={23} color={themeActiveColor} />
                                                </Pressable>
                                                <View className="w-7" />
                                                <Pressable
                                                    onPress={() => handleBookmarkToggle(group.surahNumber, ayahAr.numberInSurah)}
                                                    style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                                                >
                                                    <Bookmark size={23} color={themeActiveColor} fill={bookmarkedAyahs.has(`${group.surahNumber}-${ayahAr.numberInSurah}`) ? themeActiveColor : "transparent"} />
                                                </Pressable>
                                            </View>
                                        </View>

                                        {/* Arabic Text (Uthmani) */}
                                        <Text
                                            className={`text-3xl leading-[55px] font-bold text-right mb-6 ${readingTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                            style={{ fontFamily: 'System' }}
                                        >
                                            {cleanText}
                                        </Text>

                                        {/* Translation */}
                                        <Text className={`text-lg leading-7 ${readingTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                            {displayTranslationText}
                                        </Text>
                                    </View>
                                );
                            })}

                            {viewMode === 'Reading' && (
                                <View className="mb-8 px-2 pb-12">
                                    <Text
                                        className={`text-[28px] leading-[60px] font-bold text-justify ${readingTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        style={{ fontFamily: 'System', writingDirection: 'rtl' }}
                                    >
                                        {getJuzReadingText(group, actualGroupIndex)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )
                })}
            </ScrollView>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
                onCancel={hideAlert}
                showCancel={alertConfig.showCancel}
            />
        </View>
    );
}
