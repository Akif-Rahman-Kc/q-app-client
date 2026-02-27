import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BarChart3, Bell, Book, Camera, Flame, Pencil, PlusCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STORAGE_KEY = '@quran_profile_data';

export default function ProfileGoalsScreen() {
    const colorScheme = useColorScheme() ?? 'light';

    const [username, setUsername] = useState('Akif Rahman');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Temporary state for the modal inputs
    const [editName, setEditName] = useState('');
    const [editUri, setEditUri] = useState<string | null>(null);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        try {
            const storedData = await AsyncStorage.getItem(STORAGE_KEY);
            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (parsed.username) setUsername(parsed.username);
                if (parsed.avatarUri) setAvatarUri(parsed.avatarUri);
            }
        } catch (e) {
            console.error('Failed to load profile data', e);
        }
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setEditUri(result.assets[0].uri);
        }
    };

    const saveProfileData = async () => {
        try {
            const dataToSave = {
                username: editName || username,
                avatarUri: editUri !== null ? editUri : avatarUri,
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            setUsername(dataToSave.username);
            setAvatarUri(dataToSave.avatarUri);
            setIsEditModalVisible(false);
        } catch (e) {
            console.error('Failed to save profile data', e);
        }
    };

    const openEditModal = () => {
        setEditName(username);
        setEditUri(avatarUri);
        setIsEditModalVisible(true);
    };

    return (
        <View className="flex-1 bg-[#0a0f0a] pt-12">
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-[#1a241a]">
                <Text className="text-white text-3xl font-bold">Profile</Text>
                <TouchableOpacity className="bg-[#1a241a] p-2.5 rounded-full border border-[#2d3a2d]">
                    <View className="relative">
                        <Bell size={20} color="white" />
                        <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10b981] rounded-full border-2 border-[#1a241a]" />
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Section */}
                <View className="items-center mt-4 mb-8">
                    <View className="relative">
                        <View className="w-32 h-32 rounded-full border-4 border-[#142114] p-1">
                            <Image
                                source={avatarUri ? { uri: avatarUri } : { uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=Akif` }}
                                className="w-full h-full rounded-full bg-[#fef3c7]"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={openEditModal}
                            className="absolute bottom-1 right-1 bg-[#10b981] p-2 rounded-full border-4 border-[#0a0f0a]"
                        >
                            <Pencil size={16} color="#0a0f0a" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white text-3xl font-bold mt-4">{username}</Text>
                    {/* <View className="flex-row items-center mt-2">
                        <View className="bg-[#10b98120] px-3 py-1 rounded-full border border-[#10b98140]">
                            <Text className="text-[#10b981] text-[10px] font-bold uppercase tracking-wider">Premium Member</Text>
                        </View>
                        <Text className="text-gray-500 text-sm ml-3">• Joined Oct 2023</Text>
                    </View> */}
                </View>

                {/* Top Stats Cards */}
                <View className="flex-row px-4 space-x-4 mb-4 gap-4">
                    <StatCard
                        icon={<Book size={20} color="#10b981" />}
                        label="Quran Time"
                        value="45m"
                        trend="+5% ↗"
                    />
                    <StatCard
                        icon={<Flame size={20} color="#f97316" />}
                        label="Streak"
                        value="12 Days"
                        trend="+2% ↗"
                    />
                </View>

                {/* Verses Read Card */}
                <View className="px-4 mb-10">
                    <View className="bg-[#141b14] p-5 rounded-3xl border border-gray-900/50">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <BarChart3 size={20} color="#3b82f6" />
                                <Text className="text-gray-400 font-medium ml-2">Verses Read</Text>
                            </View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">This Week</Text>
                        </View>

                        <View className="flex-row justify-between items-end">
                            <Text className="text-white text-4xl font-bold">1,452</Text>
                            <View className="flex-row items-end space-x-1 gap-1">
                                <View className="w-2 h-6 bg-gray-800 rounded-full" />
                                <View className="w-2 h-10 bg-gray-800 rounded-full" />
                                <View className="w-2 h-12 bg-gray-700 rounded-full" />
                                <View className="w-2 h-8 bg-gray-800 rounded-full" />
                                <View className="w-2 h-16 bg-[#10b981] rounded-full" />
                                <View className="w-2 h-10 bg-gray-800 rounded-full" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Active Challenges Section */}
                <View className="px-4">
                    <View className="flex-row justify-between items-center mb-4 px-2">
                        <Text className="text-white text-xl font-bold">Active Challenges</Text>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-[#10b981] font-bold mr-1">Set Goal</Text>
                            <PlusCircle size={18} color="#10b981" />
                        </TouchableOpacity>
                    </View>

                    {/* Challenge Card 1 */}
                    <ChallengeCard
                        title="Complete Quran"
                        subtitle="Khatm in 30 Days (Ramadan Goal)"
                        badge="18 Days Left"
                        progress={15}
                        progressText="92 / 604 Pages"
                        color="#10b981"
                    />

                    {/* Challenge Card 2 */}
                    <ChallengeCard
                        title="Daily Adkar"
                        subtitle="Learn 10 new Adkar this week"
                        badge="Active"
                        progress={70}
                        progressText="7 out of 10 learned"
                        color="#3b82f6"
                    />
                </View>

                {/* Quote Section */}
                <View className="px-8 py-10 items-center">
                    <Text className="text-gray-400 text-center italic leading-6 text-base">
                        "The best of deeds are those which are done consistently, even if they are small."
                    </Text>
                    <Text className="text-gray-500 mt-2 text-sm">— Prophet Muhammad (PBUH)</Text>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/70">
                    <View className="bg-[#141b14] rounded-t-3xl p-6 border-t border-gray-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsEditModalVisible(false)} className="bg-gray-800 p-2 rounded-full">
                                <Text className="text-white font-bold">X</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 mb-2 font-semibold">Your Name</Text>
                        <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            className="bg-[#0a0f0a] border border-gray-800 text-white p-4 rounded-xl mb-4 font-bold"
                            placeholder="Enter your name"
                            placeholderTextColor="#6b7280"
                        />

                        <Text className="text-gray-400 mb-2 font-semibold">Profile Photo</Text>
                        <View className="items-center mb-8 mt-2">
                            <TouchableOpacity onPress={pickImage} className="relative">
                                <View className="w-24 h-24 rounded-full border-2 border-dashed border-[#10b981] p-1">
                                    <Image
                                        source={editUri ? { uri: editUri } : (avatarUri ? { uri: avatarUri } : { uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=Akif` })}
                                        className="w-full h-full rounded-full bg-gray-800"
                                    />
                                </View>
                                <View className="absolute bottom-0 right-0 bg-[#10b981] p-2 rounded-full border-2 border-[#141b14]">
                                    <Camera size={14} color="#050805" />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={saveProfileData}
                            className="bg-[#10b981] p-4 rounded-xl items-center shadow-lg shadow-[#10b981]/20"
                        >
                            <Text className="text-[#050805] font-black tracking-wide text-lg">Save Changes</Text>
                        </TouchableOpacity>
                        <View className="h-8" />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const StatCard = ({ icon, label, value, trend }: any) => (
    <View className="flex-1 bg-[#141b14] p-5 rounded-3xl border border-gray-900/50">
        <View className="flex-row items-center mb-4">
            {icon}
            <Text className="text-gray-400 text-xs font-medium ml-2">{label}</Text>
        </View>
        <Text className="text-white text-2xl font-bold">{value}</Text>
        <Text className="text-[#10b981] text-[10px] font-bold mt-1 uppercase">{trend}</Text>
    </View>
);

const ChallengeCard = ({ title, subtitle, badge, progress, progressText, color }: any) => (
    <View className="bg-[#141b14] p-6 rounded-3xl border border-gray-900/50 mb-4">
        <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-2">
                <Text className="text-white text-xl font-bold">{title}</Text>
                <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
            </View>
            <View className="bg-[#10b98115] px-3 py-1 rounded-lg border border-[#10b98130]">
                <Text className="text-[#10b981] text-[10px] font-bold uppercase">{badge}</Text>
            </View>
        </View>

        <View className="mt-6">
            <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-xs">Progress: {progress}%</Text>
                <Text className="text-gray-400 text-xs">{progressText}</Text>
            </View>
            <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <View
                    className="h-full rounded-full"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                />
            </View>
        </View>
    </View>
);
