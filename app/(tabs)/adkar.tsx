import adkarData from '@/assets/data/adkar.json';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    CheckCircle2, ChevronRight, CloudRain, Coffee,
    Heart, MessageSquare, Moon,
    Plane, Search, Shield,
    Star
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    ImageBackground, ScrollView,
    Text, TextInput, TouchableOpacity, View
} from 'react-native';

const data = adkarData as any;

const CATEGORIES = [
    {
        id: 'after_prayer',
        icon: MessageSquare,
        iconColor: '#10b981',
        iconBg: 'bg-[#1a2e1a]',
        title: 'After Prayer',
        sub: 'Supplications after Fard prayers',
    },
    {
        id: 'prayer',
        icon: Shield,
        iconColor: '#0891b2',
        iconBg: 'bg-[#083344]',
        title: 'Prayer & Wudu',
        sub: 'Ablution, Mosque and Salah',
    },
    {
        id: 'daily',
        icon: Coffee,
        iconColor: '#8B5CF6',
        iconBg: 'bg-[#1a1228]',
        title: 'Daily Life',
        sub: 'Eating, dressing, and daily routines',
    },
    {
        id: 'sleep',
        icon: Moon,
        iconColor: '#a855f7',
        iconBg: 'bg-[#1e1028]',
        title: 'Sleep & Waking Up',
        sub: 'Nightly protection and morning gratitude',
    },
    {
        id: 'nature',
        icon: CloudRain,
        iconColor: '#3b82f6',
        iconBg: 'bg-[#111827]',
        title: 'Nature & Weather',
        sub: 'Rain, wind and thunder',
    },
    {
        id: 'travel',
        icon: Plane,
        iconColor: '#0ea5e9',
        iconBg: 'bg-[#0c4a6e]',
        title: 'Travel',
        sub: 'Safe journeys and returns',
    },
    {
        id: 'sick',
        icon: Heart,
        iconColor: '#ef4444',
        iconBg: 'bg-[#2e1a1a]',
        title: 'Sick & Hardship',
        sub: 'Patience, health and protection',
    },
    {
        id: 'funeral',
        icon: Shield,
        iconColor: '#64748b',
        iconBg: 'bg-[#1e293b]',
        title: 'Funeral & Graves',
        sub: 'Visiting the graveyard',
    },
];

export default function AdkarScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const sabahCount = useMemo(() => (data.sabah as any[]).length, []);
    const masaCount = useMemo(() => (data.masa as any[]).length, []);

    const filteredCategories = useMemo(() =>
        search.trim()
            ? CATEGORIES.filter(c =>
                c.title.toLowerCase().includes(search.toLowerCase()) ||
                c.sub.toLowerCase().includes(search.toLowerCase())
            )
            : CATEGORIES,
        [search]
    );

    return (
        <LinearGradient colors={['#050f05', '#0a1a0f', '#050f05']} style={{ flex: 1, paddingTop: 32 }}>
            {/* <StatusBar barStyle="light-content" backgroundColor="#0a0f0a" /> */}

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <Text className="text-white text-3xl font-bold">Adkar & Duas</Text>
                <TouchableOpacity onPress={() => router.push('/adkar/favorites')} className="bg-[#1a2e1a] p-2.5 rounded-full border border-[#2d3a2d]">
                    <Star size={21} color="#facc15" fill="#facc15" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View className="px-2 mb-4">
                    <View className="flex-row items-center bg-[#142114] px-4 py-1 rounded-xl border border-[#1a2e1a]">
                        <Search size={20} color="#6b7280" />
                        <TextInput
                            placeholder="Search Adkar or Dua..."
                            placeholderTextColor="#6b7280"
                            className="flex-1 ml-3 text-white text-base"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </View>

                {/* Daily Adkar Section */}
                {!search.trim() && (
                    <>
                        <View className="flex-row justify-between items-center mb-4 px-2">
                            <Text className="text-white text-xl font-bold">Daily Adkar</Text>
                        </View>

                        <View className="flex-row justify-between mb-8 px-2">
                            <DailyCard
                                image="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=500&auto=format&fit=crop"
                                tag="MORNING"
                                title="Sabah"
                                count={`${sabahCount} Supplications`}
                                tagColor="bg-[#10b981]"
                                onPress={() => router.push('/adkar/sabah')}
                            />
                            <DailyCard
                                image="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=500&auto=format&fit=crop"
                                tag="EVENING"
                                title="Masa'"
                                count={`${masaCount} Supplications`}
                                tagColor="bg-[#a855f7]"
                                showCheck={false}
                                onPress={() => router.push('/adkar/masa')}
                            />
                        </View>
                    </>
                )}

                {/* Categories Section */}
                <View className="px-2">
                    <Text className="text-white text-xl font-bold mb-4">Categories</Text>
                    <View className="mb-4">
                        {filteredCategories.map((cat) => (
                            <CategoryItem
                                key={cat.id}
                                icon={<cat.icon size={22} color={cat.iconColor} />}
                                title={cat.title}
                                sub={cat.sub}
                                iconBg={cat.iconBg}
                                count={(data[cat.id] as any[])?.length ?? 0}
                                onPress={() => router.push({
                                    pathname: '/adkar/[category]',
                                    params: { category: cat.id }
                                })}
                            />
                        ))}
                        {filteredCategories.length === 0 && (
                            <View style={{ padding: 32, alignItems: 'center' }}>
                                <Text style={{ color: '#6b7280', fontSize: 15 }}>No results found.</Text>
                            </View>
                        )}
                    </View>

                    {/* Essential Qur'anic Duas */}
                    {!search.trim() && (
                        <>
                            <Text className="text-white text-xl font-bold mb-4 mt-2">Essential Qur'anic Duas</Text>
                            <View className="flex-row justify-between mb-12">
                                <SavedCard
                                    onPress={() => router.push({ pathname: '/surah/[id]', params: { id: '2', showAyahs: '255' } })}
                                    icon={<Shield size={20} color="#10b981" />}
                                    title="Ayatul Kursi"
                                    sub="Al-Baqarah 255"
                                    active={true}
                                />
                                <SavedCard
                                    onPress={() => router.push({ pathname: '/surah/[id]', params: { id: '2', showAyahs: '285,286' } })}
                                    icon={<Moon size={20} color="#9ca3af" />}
                                    title="Amana Rasul"
                                    sub="Al-Baqarah 285-286"
                                    active={false}
                                />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

// ─── Sub Components ────────────────────────────────────────────────────────────

const DailyCard = ({
    image, tag, title, count, tagColor, showCheck, onPress
}: {
    image: string; tag: string; title: string; count: string;
    tagColor: string; showCheck?: boolean; onPress?: () => void;
}) => (
    <TouchableOpacity className="w-[48%] overflow-hidden rounded-[24px]" onPress={onPress} activeOpacity={0.85}>
        <ImageBackground source={{ uri: image }} className="h-56 justify-end p-4">
            <View className="absolute inset-0 bg-black/40" />
            {showCheck && (
                <View className="absolute top-3 right-3 bg-[#10b981] rounded-full">
                    <CheckCircle2 size={18} color="white" />
                </View>
            )}
            <View className={`${tagColor} self-start px-2 py-1 rounded-md mb-2`}>
                <Text className="text-white font-bold text-[8px] tracking-widest">{tag}</Text>
            </View>
            <Text className="text-white font-bold text-lg">{title}</Text>
            <Text className="text-gray-300 text-[10px] mt-0.5">{count}</Text>
        </ImageBackground>
    </TouchableOpacity>
);

const CategoryItem = ({
    icon, title, sub, iconBg, count, onPress
}: {
    icon: React.ReactNode; title: string; sub: string;
    iconBg: string; count: number; onPress?: () => void;
}) => (
    <TouchableOpacity
        className="bg-[#142114] flex-row items-center p-4 rounded-[24px] mb-3"
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View className={`${iconBg} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
            {icon}
        </View>
        <View className="flex-1">
            <Text className="text-white font-bold text-base">{title}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">{sub}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>{count}</Text>
            <ChevronRight size={20} color="#4b5563" />
        </View>
    </TouchableOpacity>
);

const SavedCard = ({
    icon, title, sub, active, onPress
}: {
    icon: React.ReactNode; title: string; sub: string;
    active: boolean; onPress?: () => void;
}) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-[48%] p-5 rounded-3xl border ${active ? 'bg-[#0a1a0a] border-[#10b981]' : 'bg-[#142114] border-[#142114]'}`}
    >
        <View className="mb-4">{icon}</View>
        <Text className="text-white font-bold text-base">{title}</Text>
        <Text className="text-gray-500 text-xs mt-1">{sub}</Text>
    </TouchableOpacity>
);
