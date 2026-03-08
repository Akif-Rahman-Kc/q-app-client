import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Info } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
    const router = useRouter();

    return (
        <LinearGradient colors={['#050f05', '#0a1a0f', '#050f05']} style={{ flex: 1, paddingTop: 35 }}>
            <StatusBar barStyle="light-content" />
            <Stack.Screen options={{ headerShown: false }} />

            <View style={{ flex: 1 }}>
                {/* Header - Consistent with Qibla/Bookmarks */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114]">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <ChevronLeft size={28} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white font-bold text-xl">Notifications</Text>
                    </View>
                    <View className="w-11" />
                </View>

                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    <TouchableOpacity
                        className="bg-[#141b14] p-5 rounded-3xl border border-gray-900/50 mb-4 flex-row items-start"
                        activeOpacity={0.7}
                    >
                        <View className="bg-[#1a2e1a] p-3 rounded-2xl mr-4">
                            <Info size={20} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-white font-bold text-lg">Welcome! 👋</Text>
                                <Text className="text-gray-500 text-[10px] font-medium uppercase tracking-tighter">Just Now</Text>
                            </View>
                            <Text className="text-gray-400 text-sm leading-5">Welcome to Quran App! We're glad to have you here. May your journey with the Quran be blessed and enlightened. Enjoy exploring all the features!</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </LinearGradient>
    );
}
