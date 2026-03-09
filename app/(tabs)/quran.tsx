import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bookmark, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import juzsData from '../../assets/data/juzs.json';
import surahsData from '../../assets/data/surahs.json';

export default function QuranScreen() {
    const [activeTab, setActiveTab] = useState('Surah');
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const filteredSurahs = surahsData.filter((surah: any) => {
        if (activeTab !== 'Surah' || !searchQuery) return true;
        return surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surah.number.toString() === searchQuery;
    });

    const filteredJuzs = juzsData.filter((juz: any) => {
        if (activeTab !== 'Juz' || !searchQuery) return true;
        const normalizedQuery = searchQuery.toLowerCase().replace('juz', '').trim();
        return juz.juz.toString() === normalizedQuery;
    });

    return (
        <LinearGradient colors={['#050f05', '#0a1a0f', '#050f05']} style={{ flex: 1, paddingTop: 32 }}>
            {/* <StatusBar barStyle="light-content" /> */}

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <Text className="text-white text-3xl font-bold">Quran Library</Text>
                <TouchableOpacity onPress={() => router.push('/bookmarks')} className="bg-[#1a2e1a] p-2.5 rounded-full border border-[#2d3a2d]">
                    <Bookmark size={21} color="#10b981" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-4 mb-4">
                <View className="flex-row items-center bg-[#142114] px-4 py-1 rounded-xl border border-[#1a2e1a]">
                    <Search size={20} color="#6b7280" />
                    <TextInput
                        placeholder="Search Surah, Juz, or Ayah..."
                        placeholderTextColor="#6b7280"
                        className="flex-1 ml-3 text-white text-base"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tab Switcher */}
            <View className="px-4 mb-6">
                <View className="flex-row bg-[#142114] p-1 rounded-xl">
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setActiveTab('Surah')}
                        className="flex-1 py-2 rounded-lg"
                        style={{ backgroundColor: activeTab === 'Surah' ? '#10b981' : 'transparent' }}
                    >
                        <Text
                            className="text-center font-bold"
                            style={{ color: activeTab === 'Surah' ? '#050f05' : '#9ca3af' }}
                        >
                            Surah
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setActiveTab('Juz')}
                        className="flex-1 py-2 rounded-lg"
                        style={{ backgroundColor: activeTab === 'Juz' ? '#10b981' : 'transparent' }}
                    >
                        <Text
                            className="text-center font-bold"
                            style={{ color: activeTab === 'Juz' ? '#050f05' : '#9ca3af' }}
                        >
                            Juz
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Surah/Juz List */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {activeTab === 'Surah' ? (
                    filteredSurahs.map((surah: any) => (
                        <TouchableOpacity
                            key={surah.number}
                            onPress={() => router.push(`/surah/${surah.number}` as any)}
                            className="flex-row items-center justify-between px-6 py-5 border-b border-[#142114]"
                        >
                            <View className="flex-row items-center flex-1 pr-4">
                                {/* Diamond Number Icon */}
                                <View className="relative w-10 h-10 items-center justify-center mr-4">
                                    <View className="absolute w-8 h-8 border border-[#10b981] rotate-45 rounded-sm" />
                                    <Text className="text-[#10b981] font-bold text-sm tracking-tighter shadow-sm">{surah.number}</Text>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{surah.englishName}</Text>
                                    <Text className="text-gray-500 text-xs mt-0.5">
                                        {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses
                                    </Text>
                                </View>
                            </View>

                            {/* Arabic Name */}
                            <Text className="text-white text-2xl font-medium" style={{ fontFamily: 'System' }}>
                                {surah.name.replace('سُورَةُ ', '').replace('سورة ', '')}
                            </Text>
                        </TouchableOpacity>
                    ))
                ) : (
                    filteredJuzs.map((juz: any) => {
                        const startSurah = surahsData.find((s: any) => s.number === juz.start.surah);
                        const endSurah = surahsData.find((s: any) => s.number === juz.end.surah);

                        return (
                            <TouchableOpacity
                                key={juz.juz}
                                onPress={() => router.push(`/juz/${juz.juz}` as any)}
                                className="flex-row items-center justify-between px-6 py-5 border-b border-[#142114]"
                            >
                                <View className="flex-row items-center flex-1 pr-4">
                                    {/* Diamond Number Icon */}
                                    <View className="relative w-10 h-10 items-center justify-center mr-4">
                                        <View className="absolute w-8 h-8 border border-[#10b981] rotate-45 rounded-sm" />
                                        <Text className="text-[#10b981] font-bold text-sm tracking-tighter shadow-sm">{juz.juz}</Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-white font-bold text-lg" numberOfLines={1}>Juz {juz.juz}</Text>
                                        <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                                            {startSurah?.englishName} (Verse {juz.start.ayah}) - {endSurah?.englishName} (Verse {juz.end.ayah})
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}

                {((activeTab === 'Surah' && filteredSurahs.length === 0) || (activeTab === 'Juz' && filteredJuzs.length === 0)) && (
                    <View className="items-center mt-12">
                        <Text className="text-gray-500 text-base">No results found.</Text>
                    </View>
                )}

                <View className="h-8" />{/* Bottom Spacing */}
            </ScrollView>

        </LinearGradient>
    );
}
