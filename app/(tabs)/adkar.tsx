import { useRouter } from 'expo-router';
import { CheckCircle2, ChevronRight, Coffee, Heart, MessageSquare, Moon, Plane, Search, Shield, Sun, User } from 'lucide-react-native';
import React from 'react';
import { ImageBackground, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES = [
    { id: '1', icon: MessageSquare, iconColor: '#10b981', iconBg: 'bg-[#1a2e1a]', title: 'After Prayer', sub: 'Supplications after Fard prayers' },
    { id: '2', icon: Sun, iconColor: '#F59E0B', iconBg: 'bg-[#2e261a]', title: 'Morning', sub: 'Start your day with remembrance' },
    { id: '3', icon: Moon, iconColor: '#a855f7', iconBg: 'bg-[#2e1a2e]', title: 'Sleep & Waking Up', sub: 'Nightly protection and morning gratitude' },
    { id: '4', icon: Heart, iconColor: '#ef4444', iconBg: 'bg-[#2e1a1a]', title: 'Sick & Hardship', sub: 'Patience, health and protection' },
    { id: '5', icon: Plane, iconColor: '#3b82f6', iconBg: 'bg-[#1e293b]', title: 'Travel', sub: 'Safe journeys and returns' },
    { id: '6', icon: Coffee, iconColor: '#8B5CF6', iconBg: 'bg-[#291b3b]', title: 'Daily Life', sub: 'Eating, dressing, and daily routines' },
];

export default function AdkarScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-[#0a0f0a] pt-8">
            <StatusBar barStyle="light-content" backgroundColor="#0a0f0a" />

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <Text className="text-white text-3xl font-bold">Adkar & Duas</Text>
                <TouchableOpacity className="bg-[#1a2e1a] p-2 rounded-full">
                    <User size={24} color="#10b981" />
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
                        />
                    </View>
                </View>

                {/* Daily Adkar Section */}
                <View className="flex-row justify-between items-center mb-4 px-2">
                    <Text className="text-white text-xl font-bold">Daily Adkar</Text>
                    <TouchableOpacity><Text className="text-[#10b981] font-medium">View All</Text></TouchableOpacity>
                </View>

                <View className="flex-row justify-between mb-8 px-2">
                    <DailyCard
                        image="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=500&auto=format&fit=crop"
                        tag="MORNING"
                        title="Sabah"
                        count="24 Supplications"
                        tagColor="bg-[#10b981]"
                    />
                    <DailyCard
                        image="data:image/jpeg;base64,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"
                        tag="EVENING"
                        title="Masa'"
                        count="32 Supplications"
                        tagColor="bg-[#10b981]"
                        showCheck
                    />
                </View>

                {/* Categories Section */}
                <View className="px-2">
                    <Text className="text-white text-xl font-bold mb-4">Categories</Text>
                    <View className="mb-8">
                        {CATEGORIES.map((cat) => (
                            <CategoryItem
                                key={cat.id}
                                icon={<cat.icon size={22} color={cat.iconColor} />}
                                title={cat.title}
                                sub={cat.sub}
                                iconBg={cat.iconBg}
                            />
                        ))}
                    </View>

                    {/* Essential Duas Section */}
                    <Text className="text-white text-xl font-bold mb-4 mt-2">Essential Qur'anic Duas</Text>
                    <View className="flex-row justify-between mb-24">
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
                </View>
            </ScrollView>
        </View>
    );
}

const DailyCard = ({ image, tag, title, count, tagColor, showCheck }: { image: string, tag: string, title: string, count: string, tagColor: string, showCheck?: boolean }) => (
    <TouchableOpacity className="w-[48%] overflow-hidden rounded-[24px]">
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

const CategoryItem = ({ icon, title, sub, iconBg }: { icon: React.ReactNode, title: string, sub: string, iconBg: string }) => (
    <TouchableOpacity className="bg-[#142114] flex-row items-center p-4 rounded-[24px] mb-3">
        <View className={`${iconBg} w-12 h-12 rounded-2xl items-center justify-center mr-4`}>
            {icon}
        </View>
        <View className="flex-1">
            <Text className="text-white font-bold text-base">{title}</Text>
            <Text className="text-gray-500 text-xs mt-0.5">{sub}</Text>
        </View>
        <ChevronRight size={20} color="#4b5563" />
    </TouchableOpacity>
);

const SavedCard = ({ icon, title, sub, active, onPress }: { icon: React.ReactNode, title: string, sub: string, active: boolean, onPress?: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`w-[48%] p-5 rounded-3xl border ${active ? 'bg-[#0a1a0a] border-[#10b981]' : 'bg-[#142114] border-[#142114]'}`}
    >
        <View className="mb-4">{icon}</View>
        <Text className="text-white font-bold text-base">{title}</Text>
        <Text className="text-gray-500 text-xs mt-1">{sub}</Text>
    </TouchableOpacity>
);
