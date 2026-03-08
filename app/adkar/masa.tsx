import adkarData from '@/assets/data/adkar.json';
import { getAdkarFavorites, toggleAdkarFavorite } from '@/utils/adkar-favorites';
import { getDailyAdkarCounts, saveDailyAdkarProgress } from '@/utils/profile-stats';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Check, RotateCcw, Star } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';

type Adkar = {
    id: number;
    arabic: string;
    en_transliteration?: string;
    ml_transliteration?: string;
    en_translation?: string;
    ml_translation?: string;
    translation?: string;
    reference: string;
    repeat: number;
    en_benefit?: string;
    ml_benefit?: string;
    benefit?: string;
};

const masaAdkar: Adkar[] = (adkarData as any).masa;

export default function MasaScreen() {
    const router = useRouter();
    const [counts, setCounts] = useState<Record<number, number>>(() => {
        const init: Record<number, number> = {};
        masaAdkar.forEach(a => { init[a.id] = a.repeat; });
        return init;
    });
    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml');
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    useFocusEffect(
        React.useCallback(() => {
            const loadData = async () => {
                const favs = await getAdkarFavorites();
                const categoryFavs = favs.filter(f => f.category === 'masa').map(f => f.id);
                setFavorites(new Set(categoryFavs));

                const init: Record<number, number> = {};
                masaAdkar.forEach(a => { init[a.id] = a.repeat; });
                const dailyCounts = await getDailyAdkarCounts('masa', init);
                setCounts(dailyCounts);
            };
            loadData();
        }, [])
    );

    const handleToggleFavorite = async (id: number) => {
        const isFav = await toggleAdkarFavorite('masa', id);
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const completed = useMemo(
        () => masaAdkar.filter(a => counts[a.id] === 0).length,
        [counts]
    );
    const total = masaAdkar.length;
    const progress = total === 0 ? 0 : completed / total;

    const handleCount = useCallback((id: number) => {
        setCounts(prev => {
            if (prev[id] <= 0) return prev; // Cannot decrement below 0

            const newCounts = { ...prev, [id]: 0 };
            const newlyCompleted = masaAdkar.filter(a => newCounts[a.id] === 0).length;
            const isFullyCompleted = newlyCompleted === total;

            saveDailyAdkarProgress('masa', newCounts, isFullyCompleted).catch(console.error);

            return newCounts;
        });
    }, [total]);

    const handleReset = useCallback((id: number, repeat: number) => {
        setCounts(prev => {
            const newCounts = { ...prev, [id]: repeat };
            const newlyCompleted = masaAdkar.filter(a => newCounts[a.id] === 0).length;
            const isFullyCompleted = newlyCompleted === total;

            saveDailyAdkarProgress('masa', newCounts, isFullyCompleted).catch(console.error);

            return newCounts;
        });
    }, [total]);

    return (
        <LinearGradient colors={['#0a040f', '#18082e', '#0e0520']} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="#0a040f" />

            {/* Header */}
            <View style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2 rounded-[20px] mr-3.5"
                        style={({ pressed }) => ({
                            backgroundColor: '#2e1a3e',
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <ArrowLeft size={22} color="#a855f7" />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: '#a855f7', fontSize: 11, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>
                            EVENING
                        </Text>
                        <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
                            Adkar Al-Masa'
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={{ backgroundColor: '#2e1a3e', borderRadius: 12, overflow: 'hidden', height: 8, marginBottom: 8 }}>
                    <View style={{
                        backgroundColor: '#a855f7',
                        height: 8,
                        borderRadius: 12,
                        width: `${progress * 100}%`,
                    }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>Progress</Text>
                    <Text style={{ color: '#a855f7', fontSize: 12, fontWeight: '700' }}>
                        {completed} / {total} completed
                    </Text>
                </View>

                {/* Language Toggle */}
                <View className="flex-row justify-center py-3 border-b border-[#2e1a3e] space-x-4">
                    <Pressable
                        onPress={() => setTranslationLanguage('ml')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'ml' ? 'border-[#a855f7] bg-[#a855f720]' : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'ml' ? '#a855f7' : '#6b7280' }}>Malayalam</Text>
                    </Pressable>
                    <View className="w-2" />
                    <Pressable
                        onPress={() => setTranslationLanguage('en')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'en' ? 'border-[#a855f7] bg-[#a855f720]' : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'en' ? '#a855f7' : '#6b7280' }}>English</Text>
                    </Pressable>
                </View>
            </View>

            {/* Adkar List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
                {masaAdkar.map((adkar, index) => {
                    const remaining = counts[adkar.id];
                    const isDone = remaining === 0;

                    return (
                        <View
                            key={adkar.id}
                            style={{
                                backgroundColor: isDone ? '#1a0a2e' : '#10061e',
                                borderRadius: 24,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: isDone ? '#a855f750' : '#2e1a3e',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                                elevation: 3,
                                overflow: 'hidden',
                            }}
                        >
                            {/* Card Header */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 16 }}>
                                    <View style={{
                                        width: 28, height: 28, borderRadius: 14,
                                        backgroundColor: '#2e1a3e',
                                        alignItems: 'center', justifyContent: 'center', marginRight: 10
                                    }}>
                                        <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '700' }}>{index + 1}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#9ca3af', fontSize: 12 }} numberOfLines={1}>{adkar.reference}</Text>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => handleToggleFavorite(adkar.id)}
                                    style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.7 : 1 })}
                                >
                                    <Star size={22} color={favorites.has(adkar.id) ? "#facc15" : "#4b5563"} fill={favorites.has(adkar.id) ? "#facc15" : "transparent"} />
                                </Pressable>
                            </View>

                            {/* Arabic Text */}
                            <View style={{ paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4 }}>
                                <Text style={{
                                    color: isDone ? '#d8b4fe' : '#ffffff',
                                    fontSize: 22,
                                    fontWeight: '700',
                                    textAlign: 'right',
                                    lineHeight: 46,
                                    fontFamily: 'serif',
                                }}>
                                    {adkar.arabic}
                                </Text>
                            </View>

                            {/* Translated Content */}
                            <View style={{ paddingHorizontal: 18, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#2e1a3e', paddingTop: 14 }}>
                                <Text style={{ color: '#a855f7', fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLITERATION</Text>
                                <Text style={{ color: '#d8b4fe', fontSize: 14, fontStyle: 'italic', marginBottom: 12, lineHeight: 22 }}>
                                    {translationLanguage === 'ml' ? (adkar.ml_transliteration || adkar.en_transliteration || '') : (adkar.en_transliteration || '')}
                                </Text>

                                <Text style={{ color: '#a855f7', fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLATION</Text>
                                <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 24, marginBottom: (adkar.en_benefit || adkar.benefit) ? 12 : 4 }}>
                                    {translationLanguage === 'ml' ? (adkar.ml_translation || adkar.translation || '') : (adkar.en_translation || adkar.translation || '')}
                                </Text>

                                {!!(adkar.en_benefit || adkar.benefit) && (
                                    <View style={{ backgroundColor: '#0a040f', borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: '#a855f7' }}>
                                        <Text style={{ color: '#a855f7', fontSize: 12, fontWeight: '800', marginBottom: 4, letterSpacing: 1 }}>BENEFIT</Text>
                                        <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 20 }}>
                                            {translationLanguage === 'ml' ? (adkar.ml_benefit || adkar.benefit || '') : (adkar.en_benefit || adkar.benefit || '')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Counter Row */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 6 }}>
                                <Pressable
                                    onPress={() => handleReset(adkar.id, adkar.repeat)}
                                    style={({ pressed }) => ({
                                        padding: 8,
                                        opacity: pressed ? 0.7 : 1,
                                        backgroundColor: '#2e1a3e',
                                        borderRadius: 20
                                    })}
                                >
                                    <RotateCcw size={18} color="#a855f7" />
                                </Pressable>

                                <Pressable
                                    onPress={() => handleCount(adkar.id)}
                                    disabled={isDone}
                                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                    className={`w-10 h-10 rounded-full items-center justify-center border-2 border-[#a855f7] ${isDone ? 'bg-[#a855f7]' : 'bg-transparent'} active:scale-95 active:opacity-80`}
                                >
                                    <Check
                                        size={20}
                                        color={isDone ? '#ffffff' : '#a855f7'}
                                        strokeWidth={5}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </LinearGradient>
    );
}
