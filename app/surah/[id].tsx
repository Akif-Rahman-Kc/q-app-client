import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Bookmark, ChevronLeft, Moon, Share2, Sun } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';

// Imported offline full Quran text
import CustomAlert from '@/components/CustomAlert';
import quranEnglish from '../../assets/data/quran-en.json';
import quranMalayalam from '../../assets/data/quran-ml.json';
import quranUthmani from '../../assets/data/quran-uthmani.json';
import { getBookmarks, getLastRead, setLastRead, toggleBookmark } from '../../utils/bookmarks';
import { addQuranReadingSession } from '../../utils/profile-stats';

export default function SurahScreen() {
    const { id, scrollToAyah, showAyahs, viewMode: initialViewMode } = useLocalSearchParams();
    const [activeTargetAyah, setActiveTargetAyah] = useState<string | null>((scrollToAyah || showAyahs) as string);
    const router = useRouter();

    const scrollViewRef = React.useRef<ScrollView>(null);
    const ayahLayouts = React.useRef<{ [key: string]: number }>({});

    const [surahArabic, setSurahArabic] = useState<any>(null);
    const [surahEnglish, setSurahEnglish] = useState<any>(null);
    const [surahMalayalam, setSurahMalayalam] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(initialViewMode ? (initialViewMode as string) : ((scrollToAyah || showAyahs) ? 'Translation' : 'Reading')); // Default to Translation if scrolling to Ayah
    const [startIndex, setStartIndex] = useState<number>(0);
    const [readingTheme, setReadingTheme] = useState<'dark' | 'light'>('dark');
    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml'); // Default to Malayalam
    const [bookmarkedAyahs, setBookmarkedAyahs] = useState<Set<number>>(new Set());
    const [lastReadAyahNumber, setLastReadAyahNumber] = useState<number | null>(null);

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
                const surahBookmarks = bookmarks
                    .filter(b => b.surahNumber.toString() === id.toString())
                    .map(b => b.ayahNumber);
                setBookmarkedAyahs(new Set(surahBookmarks));

                const lastRead = await getLastRead();
                if (lastRead && lastRead.type === 'Surah' && lastRead.id === id.toString()) {
                    setLastReadAyahNumber(lastRead.ayahNumber);
                } else {
                    setLastReadAyahNumber(null);
                }
            };
            loadData();
        }, [id])
    );

    const handleBookmarkToggle = (ayahNumber: number) => {
        // Use setTimeout to allow TouchableOpacity's animation to finish
        setTimeout(async () => {
            setBookmarkedAyahs(prev => {
                const next = new Set(prev);
                if (next.has(ayahNumber)) {
                    next.delete(ayahNumber);
                } else {
                    next.add(ayahNumber);
                }
                return next;
            });

            await toggleBookmark(Number(id), ayahNumber);
        }, 50);
    };

    const promptSetLastRead = (ayahNumber: number, surahName: string) => {
        showAlert({
            title: "Mark Last Read",
            message: `Do you want to mark Ayah ${ayahNumber} as your last read point?`,
            type: 'success',
            onConfirm: async () => {
                hideAlert();
                await setLastRead('Surah', id as string, Number(id), ayahNumber, surahName, viewMode as 'Reading' | 'Translation');
                setLastReadAyahNumber(ayahNumber);
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

    const handleShareAyah = async (arabicText: string, englishText: string, ayahNumber: number) => {
        try {
            const surahName = surahEnglish?.englishName || `Surah ${id}`;
            const message = `${arabicText}\n\n"${englishText}"\n\n— Quran ${surahName} ${id}:${ayahNumber}`;

            await Share.share({
                message,
                title: `Share Ayah ${id}:${ayahNumber}`
            });
        } catch (error: any) {
            console.error('Error sharing ayah:', error.message);
        }
    };

    const getReadingText = () => {
        if (!surahArabic) return '';

        return surahArabic.ayahs.slice(startIndex).map((ayah: any) => {
            const cleanText = removeBismillah(ayah.text, id as string);
            const arabicNumber = ayah.numberInSurah
                .toString()
                .replace(/\d/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
            const isTarget = activeTargetAyah === ayah.numberInSurah.toString();

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
                        onPress={() => promptSetLastRead(ayah.numberInSurah, surahEnglish?.englishName || '')}
                        className={lastReadAyahNumber === ayah.numberInSurah ? "text-[#10b981]" : isTarget ? "text-[#10b981]" : ""}
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

        // Find by Surah number within the fully localized uthmani data
        let arabicData = quranUthmani.surahs.find((s: any) => s.number.toString() === id.toString());
        let englishData = quranEnglish.surahs.find((s: any) => s.number.toString() === id.toString());
        let malayalamData = quranMalayalam.surahs.find((s: any) => s.number.toString() === id.toString());

        if (arabicData && englishData && malayalamData) {
            // Apply filtering if showAyahs is provided
            if (showAyahs) {
                const requestedAyahs = (showAyahs as string).split(',').map(n => n.trim());
                arabicData = {
                    ...arabicData,
                    ayahs: arabicData.ayahs.filter((a: any) => requestedAyahs.includes(a.numberInSurah.toString()))
                };
                englishData = {
                    ...englishData,
                    ayahs: englishData.ayahs.filter((a: any) => requestedAyahs.includes(a.numberInSurah.toString()))
                };
                malayalamData = {
                    ...malayalamData,
                    ayahs: malayalamData.ayahs.filter((a: any) => requestedAyahs.includes(a.numberInSurah.toString()))
                };
            }

            setSurahArabic(arabicData);
            setSurahEnglish(englishData);
            setSurahMalayalam(malayalamData);

            // scrollToAyah should show the full surah but start from that index
            // showAyahs should filter the surah
            if (scrollToAyah && !showAyahs) {
                const index = arabicData.ayahs.findIndex((a: any) => a.numberInSurah.toString() === scrollToAyah);
                if (index > -1) {
                    setStartIndex(index);
                }
            } else {
                setStartIndex(0);
            }
        }
        setLoading(false);
    }, [id, showAyahs]);

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
                    if (sessionStartTime.current && surahArabic) {
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
                if (sessionStartTime.current && surahArabic && AppState.currentState === 'active') {
                    const durationMs = Date.now() - sessionStartTime.current;
                    const durationMinutes = Math.floor(durationMs / 60000);
                    if (durationMinutes >= 1) {
                        addQuranReadingSession(durationMinutes).catch(console.error);
                    }
                }
            };
        }, [surahArabic, id])
    );

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
        <View className="flex-1 pt-7 bg-[#050f05]">
            <Stack.Screen options={{ headerShown: false }} />
            {/* <StatusBar barStyle="light-content" /> */}

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114]">
                <TouchableOpacity onPress={() => router.back()} className="p-2 w-11">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center flex-1">
                    <Text className="font-bold text-xl text-white">{surahEnglish.englishName}</Text>
                    <Text className="text-xs text-gray-400">{surahEnglish.englishNameTranslation}</Text>
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

            {/* Bismillah Header (Except Surah 1 and 9 typically, but Bismillah is part of data if applicable) */}
            <ScrollView ref={scrollViewRef} className={`flex-1 px-4 pt-4 ${readingTheme === 'dark' ? 'bg-[#050f05]' : 'bg-[#c3dbc8]'}`} showsVerticalScrollIndicator={false}>

                {(id !== '1' && id !== '9' && startIndex === 0 && !showAyahs) ? (
                    <View className="items-center justify-center py-6 mb-4">
                        <Text className={`text-3xl font-bold ${readingTheme === 'dark' ? 'text-[#10b981]' : 'text-[#059669]'}`} style={{ fontFamily: 'System' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                        </Text>
                    </View>
                ) : null}

                {startIndex > 0 && !showAyahs && (
                    <TouchableOpacity
                        onPress={() => setStartIndex(0)}
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
                        <Text className={`font-bold ${readingTheme === 'dark' ? 'text-[#10b981]' : 'text-[#059669]'}`}>Load Beginning of Surah</Text>
                    </TouchableOpacity>
                )}

                {viewMode === 'Translation' ? (
                    (() => {
                        return surahArabic.ayahs.slice(startIndex).map((ayah: any, index: number) => {
                            const englishAyah = surahEnglish.ayahs.find((ea: any) => ea.numberInSurah === ayah.numberInSurah);
                            const malayalamAyah = surahMalayalam.ayahs.find((ma: any) => ma.numberInSurah === ayah.numberInSurah);

                            const displayTranslationText = translationLanguage === 'ml' ? malayalamAyah?.text : englishAyah?.text;

                            const themeActiveColor = readingTheme === 'dark' ? '#10b981' : '#059669';
                            const isLastRead = lastReadAyahNumber === ayah.numberInSurah;
                            const isTarget = activeTargetAyah === ayah.numberInSurah.toString();

                            return (
                                <View
                                    key={ayah.numberInSurah}
                                    onLayout={(event) => {
                                        if (isTarget) {
                                            const y = event.nativeEvent.layout.y;
                                            setTimeout(() => {
                                                scrollViewRef.current?.scrollTo({ y: y - 20, animated: true });
                                            }, 250);
                                        }
                                    }}
                                    className={`mb-8 border-b pb-6 ${readingTheme === 'dark' ? 'border-[#142114]' : 'border-gray-200'}`}
                                >

                                    {/* Actions Bar for Ayah */}
                                    <View className={`flex-row items-center justify-between px-4 py-2 rounded-xl mb-4 ${readingTheme === 'dark' ? 'bg-[#142114]' : 'bg-gray-100'} ${isLastRead ? 'border border-[#10b98150]' : ''}`}>
                                        <TouchableOpacity
                                            onPress={() => promptSetLastRead(ayah.numberInSurah, surahEnglish?.englishName || '')}
                                            className={`w-8 h-8 rounded-full items-center justify-center ${isLastRead || isTarget ? 'bg-[#10b981]' : readingTheme === 'dark' ? 'bg-[#2d3a2d]' : 'bg-gray-300'}`}>
                                            <Text className={`font-bold text-sm ${isLastRead || isTarget ? 'text-[#050f05]' : readingTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{ayah.numberInSurah}</Text>
                                        </TouchableOpacity>
                                        <View className="flex-row space-x-6">
                                            <TouchableOpacity onPress={() => handleShareAyah(removeBismillah(ayah.text, id as string), displayTranslationText || '', ayah.numberInSurah)}>
                                                <Share2 size={23} color={themeActiveColor} />
                                            </TouchableOpacity>
                                            <View className="w-7" />
                                            <Pressable
                                                onPress={() => handleBookmarkToggle(ayah.numberInSurah)}
                                                style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                                            >
                                                <Bookmark size={23} color={themeActiveColor} fill={bookmarkedAyahs.has(ayah.numberInSurah) ? themeActiveColor : "transparent"} />
                                            </Pressable>
                                        </View>
                                    </View>

                                    {/* Arabic Text (Uthmani) */}
                                    <Text
                                        className={`text-3xl leading-[55px] font-bold text-right mb-6 ${readingTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                                        style={{ fontFamily: 'System' }}
                                    >
                                        {removeBismillah(ayah.text, id as string)}
                                    </Text>

                                    {/* Translation */}
                                    <Text className={`text-lg leading-7 ${readingTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {displayTranslationText}
                                    </Text>
                                </View>
                            );
                        })
                    })()
                ) : (
                    <View className="mb-8 px-2 pb-12">
                        <Text
                            className={`text-[28px] leading-[60px] font-bold text-justify ${readingTheme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'System', writingDirection: 'rtl' }}
                        >
                            {getReadingText()}
                        </Text>
                    </View>
                )}

                <View className="h-12" />
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
