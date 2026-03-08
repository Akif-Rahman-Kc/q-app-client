import adkarData from '@/assets/data/adkar.json';
import { getAdkarFavorites, toggleAdkarFavorite } from '@/utils/adkar-favorites';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import React, { useState } from 'react';
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

const CATEGORY_META: Record<string, {
    label: string;
    subtitle: string;
    tag: string;
    accentColor: string;
    activeClass: string;
    accentBorder: string;
    accentBg: string;
    bgColor: string;
    cardBg: string;
    cardBorder: string;
    cardDoneBg: string;
    cardDoneBorder: string;
    progressBg: string;
    expansionAccent: string;
    gradientColors: [string, string, string];
}> = {
    after_prayer: {
        label: 'After Prayer',
        subtitle: 'Supplications after obligatory prayers',
        tag: 'POST SALAH',
        accentColor: '#10b981',
        activeClass: 'border-[#10b981] bg-[#10b98120]',
        accentBorder: 'border-[#10b981]',
        accentBg: 'bg-[#10b981]',
        bgColor: '#1a2e1a',
        cardBg: '#0d1a0d',
        cardBorder: '#1a2e1a',
        cardDoneBg: '#050a05',
        cardDoneBorder: '#10b981',
        progressBg: '#1a2e1a',
        expansionAccent: '#a7f3d0',
        gradientColors: ['#050a05', '#0d1a0d', '#1a2e1a'],
    },
    prayer: {
        label: 'Prayer & Wudu',
        subtitle: 'Ablution, Mosque and Salah',
        tag: 'SALAH',
        accentColor: '#0891b2',
        activeClass: 'border-[#0891b2] bg-[#0891b220]',
        accentBorder: 'border-[#0891b2]',
        accentBg: 'bg-[#0891b2]',
        bgColor: '#083344',
        cardBg: '#051d28',
        cardBorder: '#0b3c47',
        cardDoneBg: '#020a0e',
        cardDoneBorder: '#0891b2',
        progressBg: '#0b3c47',
        expansionAccent: '#22d3ee',
        gradientColors: ['#020a0e', '#051d28', '#083344'],
    },
    nature: {
        label: 'Nature & Weather',
        subtitle: 'Rain, wind and thunder',
        tag: 'NATURE',
        accentColor: '#3b82f6',
        activeClass: 'border-[#3b82f6] bg-[#3b82f620]',
        accentBorder: 'border-[#3b82f6]',
        accentBg: 'bg-[#3b82f6]',
        bgColor: '#111827',
        cardBg: '#0b0f1a',
        cardBorder: '#1e293b',
        cardDoneBg: '#05070a',
        cardDoneBorder: '#3b82f6',
        progressBg: '#1e293b',
        expansionAccent: '#93c5fd',
        gradientColors: ['#05070a', '#0b0f1a', '#111827'],
    },
    funeral: {
        label: 'Funeral & Graves',
        subtitle: 'Visiting the graveyard',
        tag: 'JANAZAH',
        accentColor: '#64748b',
        activeClass: 'border-[#64748b] bg-[#64748b20]',
        accentBorder: 'border-[#64748b]',
        accentBg: 'bg-[#64748b]',
        bgColor: '#1e293b',
        cardBg: '#111827',
        cardBorder: '#1e293b',
        cardDoneBg: '#0a0f1a',
        cardDoneBorder: '#64748b',
        progressBg: '#1e293b',
        expansionAccent: '#cbd5e1',
        gradientColors: ['#0a0f1a', '#111827', '#1e293b'],
    },
    sleep: {
        label: 'Sleep & Waking Up',
        subtitle: 'Nightly protection and morning gratitude',
        tag: 'SLEEP',
        accentColor: '#a855f7',
        activeClass: 'border-[#a855f7] bg-[#a855f720]',
        accentBorder: 'border-[#a855f7]',
        accentBg: 'bg-[#a855f7]',
        bgColor: '#1e1028',
        cardBg: '#120a1a',
        cardBorder: '#1e1028',
        cardDoneBg: '#0a050d',
        cardDoneBorder: '#a855f7',
        progressBg: '#1e1028',
        expansionAccent: '#d8b4fe',
        gradientColors: ['#0a050d', '#120a1a', '#1e1028'],
    },
    sick: {
        label: 'Sick & Hardship',
        subtitle: 'Patience, health, and protection',
        tag: 'HEALING',
        accentColor: '#ef4444',
        activeClass: 'border-[#ef4444] bg-[#ef444420]',
        accentBorder: 'border-[#ef4444]',
        accentBg: 'bg-[#ef4444]',
        bgColor: '#2e1a1a',
        cardBg: '#1a0d0d',
        cardBorder: '#2e1a1a',
        cardDoneBg: '#0d0606',
        cardDoneBorder: '#ef4444',
        progressBg: '#2e1a1a',
        expansionAccent: '#fca5a5',
        gradientColors: ['#0d0606', '#1a0d0d', '#2e1a1a'],
    },
    travel: {
        label: 'Travel',
        subtitle: 'Safe journeys and returns',
        tag: 'SAFAR',
        accentColor: '#0ea5e9',
        activeClass: 'border-[#0ea5e9] bg-[#0ea5e920]',
        accentBorder: 'border-[#0ea5e9]',
        accentBg: 'bg-[#0ea5e9]',
        bgColor: '#0c4a6e',
        cardBg: '#072a3e',
        cardBorder: '#0c4a6e',
        cardDoneBg: '#03141f',
        cardDoneBorder: '#0ea5e9',
        progressBg: '#0c4a6e',
        expansionAccent: '#7dd3fc',
        gradientColors: ['#03141f', '#072a3e', '#0c4a6e'],
    },
    daily: {
        label: 'Daily Life',
        subtitle: 'Eating, dressing, and daily routines',
        tag: 'GENERAL',
        accentColor: '#8B5CF6',
        activeClass: 'border-[#8B5CF6] bg-[#8B5CF620]',
        accentBorder: 'border-[#8B5CF6]',
        accentBg: 'bg-[#8B5CF6]',
        bgColor: '#1a1228',
        cardBg: '#110b1a',
        cardBorder: '#1a1228',
        cardDoneBg: '#08050d',
        cardDoneBorder: '#8B5CF6',
        progressBg: '#1a1228',
        expansionAccent: '#c4b5fd',
        gradientColors: ['#08050d', '#110b1a', '#1a1228'],
    },
};

export default function CategoryScreen() {
    const router = useRouter();
    const { category } = useLocalSearchParams<{ category: string }>();
    const catKey = category as string;
    const meta = CATEGORY_META[catKey] ?? CATEGORY_META['daily'];
    const adkarList: Adkar[] = ((adkarData as any)[catKey] ?? []) as Adkar[];

    const [translationLanguage, setTranslationLanguage] = useState<'ml' | 'en'>('ml');
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    useFocusEffect(
        React.useCallback(() => {
            const loadFavorites = async () => {
                const favs = await getAdkarFavorites();
                const categoryFavs = favs.filter(f => f.category === catKey).map(f => f.id);
                setFavorites(new Set(categoryFavs));
            };
            loadFavorites();
        }, [catKey])
    );

    const handleToggleFavorite = async (id: number) => {
        const isFav = await toggleAdkarFavorite(catKey, id);
        setFavorites(prev => {
            const next = new Set(prev);
            if (isFav) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    return (
        <LinearGradient colors={meta.gradientColors} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={{ paddingTop: 52, paddingHorizontal: 20, paddingBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Pressable
                        onPress={() => router.back()}
                        className="p-2 rounded-[20px] mr-3.5"
                        style={({ pressed }) => ({
                            backgroundColor: meta.bgColor,
                            opacity: pressed ? 0.7 : 1
                        })}
                    >
                        <ArrowLeft size={22} color={meta.accentColor} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: meta.accentColor, fontSize: 11, fontWeight: '800', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>
                            {meta.tag}
                        </Text>
                        <Text style={{ color: '#ffffff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
                            {meta.label}
                        </Text>
                    </View>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 14 }}>{meta.subtitle}</Text>


                {/* Language Toggle */}
                <View className="flex-row justify-center py-3 border-b border-[#142114] space-x-4">
                    <Pressable
                        onPress={() => setTranslationLanguage('ml')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'ml' ? meta.activeClass : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'ml' ? meta.accentColor : '#6b7280' }}>Malayalam</Text>
                    </Pressable>
                    <View className="w-2" />
                    <Pressable
                        onPress={() => setTranslationLanguage('en')}
                        className={`px-3 py-1 rounded-full border ${translationLanguage === 'en' ? meta.activeClass : 'border-[#6b7280] bg-transparent'}`}
                        style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                        <Text className="text-sm font-bold" style={{ color: translationLanguage === 'en' ? meta.accentColor : '#6b7280' }}>English</Text>
                    </Pressable>
                </View>
            </View>

            {/* Adkar List */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
                {adkarList.length === 0 ? (
                    <View style={{ alignItems: 'center', padding: 40 }}>
                        <Text style={{ color: '#6b7280', fontSize: 16 }}>No adkar found for this category.</Text>
                    </View>
                ) : adkarList.map((adkar, index) => (
                    <View
                        key={adkar.id}
                        style={{
                            backgroundColor: meta.cardBg,
                            borderRadius: 24,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: meta.cardBorder,
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
                                    backgroundColor: meta.bgColor,
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
                                color: '#ffffff',
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
                        <View style={{ paddingHorizontal: 18, paddingBottom: 16, borderTopWidth: 1, borderTopColor: meta.cardBorder, paddingTop: 14 }}>
                            <Text style={{ color: meta.accentColor, fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLITERATION</Text>
                            <Text style={{ color: meta.expansionAccent, fontSize: 14, fontStyle: 'italic', marginBottom: 12, lineHeight: 22 }}>
                                {translationLanguage === 'ml' ? (adkar.ml_transliteration || adkar.en_transliteration || '') : (adkar.en_transliteration || '')}
                            </Text>

                            <Text style={{ color: meta.accentColor, fontSize: 13, fontWeight: '700', marginBottom: 4, letterSpacing: 1 }}>TRANSLATION</Text>
                            <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 24, marginBottom: (adkar.en_benefit || adkar.benefit) ? 12 : 4 }}>
                                {translationLanguage === 'ml' ? (adkar.ml_translation || adkar.translation || '') : (adkar.en_translation || adkar.translation || '')}
                            </Text>

                            {!!(adkar.en_benefit || adkar.benefit) && (
                                <View style={{ backgroundColor: meta.cardDoneBg, borderRadius: 12, padding: 14, borderLeftWidth: 4, borderLeftColor: meta.accentColor }}>
                                    <Text style={{ color: meta.accentColor, fontSize: 12, fontWeight: '800', marginBottom: 4, letterSpacing: 1 }}>BENEFIT</Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 13, lineHeight: 20 }}>
                                        {translationLanguage === 'ml' ? (adkar.ml_benefit || adkar.benefit || '') : (adkar.en_benefit || adkar.benefit || '')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </LinearGradient>
    );
}
