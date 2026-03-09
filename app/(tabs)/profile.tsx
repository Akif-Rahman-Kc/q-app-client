import CustomAlert from '@/components/CustomAlert';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addCustomChallenge, deleteChallenge, getProfileStats, ProfileStats } from '@/utils/profile-stats';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { BarChart3, Bell, Book, Camera, Flame, Heart, Pencil, PlusCircle, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const STORAGE_KEY = '@quran_profile_data';

export default function ProfileGoalsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';

    const [username, setUsername] = useState('Akif Rahman');
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);

    // Profile Stats State
    const [stats, setStats] = useState<ProfileStats | null>(null);

    // Load Profile Stats on Mount/Focus
    useFocusEffect(
        React.useCallback(() => {
            const loadStats = async () => {
                const statsData = await getProfileStats();
                setStats(statsData);
            };
            loadStats();
        }, [])
    );

    // Temporary state for the modal inputs
    const [editName, setEditName] = useState('');
    const [editUri, setEditUri] = useState<string | null>(null);

    // Goal Modal State
    const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalSubtitle, setGoalSubtitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('10');
    const [goalType, setGoalType] = useState<'quran_pages' | 'adkar_count' | 'streak_days'>('quran_pages');
    const [goalColor, setGoalColor] = useState('#10b981');

    const [isAppUsageModalVisible, setIsAppUsageModalVisible] = useState(false);

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

    const handleAddGoal = async () => {
        if (!goalTitle || !goalTarget) return;

        try {
            await addCustomChallenge({
                title: goalTitle,
                subtitle: goalSubtitle || 'Custom Goal',
                badge: `${goalTarget} ${goalType === 'quran_pages' ? 'Pages' : 'Days'}`,
                color: goalColor,
                targetVal: parseInt(goalTarget, 10),
                type: goalType,
                durationDays: parseInt(goalTarget, 10),
                startDate: dayjs().format('YYYY-MM-DD'),
                status: 'ongoing'
            });

            // Refresh stats
            const newStats = await getProfileStats();
            setStats(newStats);

            setIsAddGoalModalVisible(false);
            // Reset form
            setGoalTitle('');
            setGoalSubtitle('');
            setGoalTarget('10');
        } catch (error: any) {
            showAlert({
                title: "Cannot Create Goal",
                message: error.message,
                type: 'error',
                onConfirm: hideAlert,
                showCancel: false
            });
        }
    };

    const handleDeleteGoal = (id: string, title: string) => {
        showAlert({
            title: "Delete Goal",
            message: `Are you sure you want to delete "${title}"?`,
            type: 'delete',
            onConfirm: async () => {
                hideAlert();
                await deleteChallenge(id);
                const newStats = await getProfileStats();
                setStats(newStats);
            },
            showCancel: true
        });
    };

    const renderWeeklyUsageChart = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            days.push(dayjs().subtract(i, 'day'));
        }

        // Find absolute max
        let maxTime = 10; // minimum scale
        if (stats?.appUsageHistory) {
            const maxHistorical = Math.max(...stats.appUsageHistory.map(h => h.count));
            if (maxHistorical > 10) maxTime = maxHistorical;
        }

        return days.map((dayObj, idx) => {
            const dateStr = dayObj.format('YYYY-MM-DD');
            const dayName = dayObj.format('ddd'); // Sun, Mon, etc
            const historyItem = stats?.appUsageHistory?.find(h => h.date === dateStr);
            const minutes = historyItem ? historyItem.count : 0;

            // Set min height so there's always a visual stub
            const heightPercentage = Math.max((minutes / maxTime) * 100, 5);
            const isToday = idx === 6;

            return (
                <View key={dateStr} className="items-center flex-1">
                    <Text className="text-gray-400 text-[10px] font-bold mb-2">{minutes > 0 ? `${minutes}m` : '-'}</Text>
                    <View className="w-full px-1 justify-end h-32 flex-col items-center">
                        <View
                            className={`w-6 rounded-md ${isToday ? 'bg-[#10b981]' : 'bg-[#1f2937]'}`}
                            style={{ height: `${heightPercentage}%` }}
                        />
                    </View>
                    <Text className={`text-[10px] font-bold mt-2 ${isToday ? 'text-[#10b981]' : 'text-gray-500'}`}>{dayName}</Text>
                </View>
            );
        });
    }

    return (
        <LinearGradient colors={['#050f05', '#0a1a0f', '#050f05']} style={{ flex: 1, paddingTop: 48 }}>
            {/* <StatusBar barStyle="light-content" /> */}

            {/* Header */}
            <View className="flex-row justify-between items-center px-6 pb-4 border-b border-[#1a241a]">
                <Text className="text-white text-3xl font-bold">Profile</Text>
                <TouchableOpacity
                    onPress={() => router.push('/notifications')}
                    className="bg-[#1a2e1a] p-2.5 rounded-full border border-[#2d3a2d]"
                >
                    <View className="relative">
                        <Bell size={21} color="#10b981" />
                        {/* <View className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ef4444] rounded-full border-2 border-[#1a2e1a]" /> */}
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
                        label="Today's Quran Time"
                        value={`${stats?.quranTimeHistory?.find(h => h.date === dayjs().format('YYYY-MM-DD'))?.count || 0}m`}
                    />
                    <StatCard
                        icon={<Flame size={20} color="#f97316" />}
                        label="Streak"
                        value={`${stats?.streakDays || 0} Days`}
                    />
                </View>

                {/* App Usage Card */}
                <View className="px-4 mb-10">
                    <TouchableOpacity
                        onPress={() => setIsAppUsageModalVisible(true)}
                        activeOpacity={0.8}
                        className="bg-[#141b14] p-5 rounded-3xl border border-gray-900/50">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <BarChart3 size={20} color="#3b82f6" />
                                <Text className="text-gray-400 font-medium ml-2">App Usage Time</Text>
                            </View>
                            <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">This Week</Text>
                        </View>

                        <View className="flex-row justify-between items-end">
                            <Text className="text-white text-4xl font-bold">
                                {stats?.appUsageHistory?.length
                                    ? stats.appUsageHistory.reduce((sum, h) => sum + h.count, 0)
                                    : 0}m
                            </Text>
                            <View className="flex-row items-end space-x-1 gap-1">
                                {stats?.appUsageHistory && stats.appUsageHistory.length > 0 ? (
                                    stats.appUsageHistory.map((day: any, idx: number) => {
                                        const maxTime = Math.max(...stats.appUsageHistory.map((h: any) => h.count));
                                        const minHeight = 4;
                                        const height = maxTime === 0 ? minHeight : Math.max(minHeight, Math.round((day.count / maxTime) * 64));

                                        const isToday = idx === stats.appUsageHistory.length - 1;

                                        return (
                                            <View
                                                key={day.date}
                                                style={{ height, width: 8, backgroundColor: isToday ? '#10b981' : '#1f2937', borderRadius: 9999 }}
                                            />
                                        )
                                    })
                                ) : (
                                    <>
                                        <View className="w-2 h-1 bg-gray-800 rounded-full" />
                                        <View className="w-2 h-1 bg-gray-800 rounded-full" />
                                        <View className="w-2 h-1 bg-gray-800 rounded-full" />
                                        <View className="w-2 h-1 bg-gray-800 rounded-full" />
                                    </>
                                )}
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Active Challenges Section */}
                <View className="px-4">
                    <View className="flex-row justify-between items-center mb-4 px-2">
                        <Text className="text-white text-xl font-bold">Active Challenges</Text>
                        <TouchableOpacity
                            className="flex-row items-center"
                            onPress={() => setIsAddGoalModalVisible(true)}
                        >
                            <Text className="text-[#10b981] font-bold mr-1">Set Goal</Text>
                            <PlusCircle size={18} color="#10b981" />
                        </TouchableOpacity>
                    </View>

                    {stats?.challenges && stats.challenges.length > 0 ? (
                        stats.challenges.map((challenge: any) => (
                            <ChallengeCard
                                key={challenge.id}
                                id={challenge.id}
                                title={challenge.title}
                                subtitle={challenge.subtitle}
                                badge={challenge.badge}
                                progress={challenge.progress}
                                targetProgress={challenge.targetProgress}
                                progressText={challenge.progressText}
                                color={challenge.color}
                                status={challenge.status}
                                onDelete={handleDeleteGoal}
                            />
                        ))
                    ) : (
                        <View className="bg-[#141b14] p-8 rounded-3xl border border-gray-900/50 items-center justify-center mb-4">
                            <Book size={40} color="#1f2937" />
                            <Text className="text-gray-500 text-center mt-3 font-medium">No active goals.</Text>
                            <Text className="text-gray-600 text-xs text-center mt-1">Tap 'Set Goal' to start tracking.</Text>
                        </View>
                    )}
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
                statusBarTranslucent={true}
                visible={isEditModalVisible}
                onRequestClose={() => setIsEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/70">
                    <View className="flex-1 justify-end">
                        <View className="bg-[#141b14] rounded-t-3xl p-6 pb-8 border-t border-gray-800">
                            <View className="flex-row justify-between items-center mb-7">
                                <Text className="text-white text-2xl font-bold">Edit Profile</Text>
                                <TouchableOpacity onPress={() => setIsEditModalVisible(false)} className="bg-gray-800 px-3.5 py-2 rounded-full">
                                    <Text className="text-white font-bold">X</Text>
                                </TouchableOpacity>
                            </View>

                            <KeyboardAwareScrollView
                                keyboardShouldPersistTaps="handled"
                                bottomOffset={0}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text className="text-gray-400 mb-3 font-semibold ml-0.5">Profile Photo</Text>
                                <View className="items-center mb-6 mt-3">
                                    <TouchableOpacity onPress={pickImage} className="relative">
                                        <View className="w-32 h-32 rounded-full border-2 border-dashed border-[#10b981] p-1">
                                            <Image
                                                source={editUri ? { uri: editUri } : (avatarUri ? { uri: avatarUri } : { uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=Akif` })}
                                                className="w-full h-full rounded-full bg-gray-800"
                                            />
                                        </View>
                                        <View className="absolute bottom-0 right-0 bg-[#10b981] p-2 rounded-full border-2 border-[#141b14]">
                                            <Camera size={18} color="#050805" />
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-gray-400 mb-3 font-semibold ml-0.5">Your Name</Text>
                                <TextInput
                                    value={editName}
                                    onChangeText={setEditName}
                                    className="bg-[#0a0f0a] border border-gray-800 text-white p-4 rounded-xl mb-6 font-bold"
                                    placeholder="Enter your name"
                                    placeholderTextColor="#6b7280"
                                />

                                <TouchableOpacity
                                    onPress={saveProfileData}
                                    className="bg-[#10b981] p-4 rounded-xl items-center shadow-lg shadow-[#10b981]/20"
                                >
                                    <Text className="text-[#050805] font-black tracking-wide text-lg">Save Changes</Text>
                                </TouchableOpacity>
                                <Text className="text-gray-600 text-xs text-center mt-4">
                                    Your name and photo will be visible only on this device
                                </Text>
                            </KeyboardAwareScrollView>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Goal Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                statusBarTranslucent={true}
                visible={isAddGoalModalVisible}
                onRequestClose={() => setIsAddGoalModalVisible(false)}
            >
                <View className="flex-1 bg-black/70">
                    <View className="flex-1 justify-end">
                        <View className="bg-[#141b14] rounded-t-3xl p-6 pb-8 border-t border-gray-800">
                            <View className="flex-row justify-between items-center mb-7">
                                <Text className="text-white text-2xl font-bold">New Goal</Text>
                                <TouchableOpacity onPress={() => setIsAddGoalModalVisible(false)} className="bg-gray-800 px-3.5 py-2 rounded-full">
                                    <Text className="text-white font-bold">X</Text>
                                </TouchableOpacity>
                            </View>

                            <KeyboardAwareScrollView
                                showsVerticalScrollIndicator={false}
                                className="max-h-[70vh]"
                                keyboardShouldPersistTaps="handled"
                                bottomOffset={0}
                            >
                                <Text className="text-gray-400 mb-2 font-semibold ml-0.5">Goal Title</Text>
                                <TextInput
                                    value={goalTitle}
                                    onChangeText={setGoalTitle}
                                    className="bg-[#0a0f0a] border border-gray-800 text-white p-4 rounded-xl mb-4 font-bold"
                                    placeholder="e.g. Daily Quran"
                                    placeholderTextColor="#4b5563"
                                />

                                <Text className="text-gray-400 mb-2 font-semibold ml-0.5">Subtitle (Optional)</Text>
                                <TextInput
                                    value={goalSubtitle}
                                    onChangeText={setGoalSubtitle}
                                    className="bg-[#0a0f0a] border border-gray-800 text-white p-4 rounded-xl mb-4"
                                    placeholder="e.g. Finish the whole Quran"
                                    placeholderTextColor="#4b5563"
                                />

                                <Text className="text-gray-400 mb-2 font-semibold ml-0.5">Challenge Type</Text>
                                <View className="flex-row justify-between mb-4">
                                    <Pressable
                                        onPress={() => setGoalType('quran_pages')}
                                        className={`flex-1 p-3 rounded-xl border ${goalType === 'quran_pages' ? 'bg-[#10b98120] border-[#10b981]' : 'bg-[#0a0f0a] border-gray-800'} items-center mr-2`}
                                        style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
                                    >
                                        <Book size={20} color={goalType === 'quran_pages' ? '#10b981' : '#6b7280'} />
                                        <Text className={`mt-2 font-bold ${goalType === 'quran_pages' ? 'text-white' : 'text-gray-500'}`}>Quran</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => setGoalType('adkar_count')}
                                        className={`flex-1 p-3 rounded-xl border ${goalType === 'adkar_count' ? 'bg-[#3b82f620] border-[#3b82f6]' : 'bg-[#0a0f0a] border-gray-800'} items-center mx-1`}
                                        style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
                                    >
                                        <Heart size={20} color={goalType === 'adkar_count' ? '#3b82f6' : '#6b7280'} />
                                        <Text className={`mt-2 font-bold ${goalType === 'adkar_count' ? 'text-white' : 'text-gray-500'}`}>Adkar</Text>
                                    </Pressable>
                                </View>

                                <View className="flex-row justify-between items-center mb-6">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-gray-400 mb-2 font-semibold ml-0.5">Duration (Days)</Text>
                                        <TextInput
                                            value={goalTarget}
                                            onChangeText={setGoalTarget}
                                            keyboardType="numeric"
                                            className="bg-[#0a0f0a] border border-gray-800 text-white p-4 rounded-xl font-bold"
                                            placeholder="10"
                                            placeholderTextColor="#4b5563"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 mb-2 font-semibold ml-0.5">Color</Text>
                                        <View className="flex-row">
                                            {[
                                                { hex: '#10b981', bgClass: 'bg-[#10b981]' },
                                                { hex: '#3b82f6', bgClass: 'bg-[#3b82f6]' },
                                                { hex: '#f97316', bgClass: 'bg-[#f97316]' },
                                                { hex: '#a855f7', bgClass: 'bg-[#a855f7]' }
                                            ].map(colorObj => (
                                                <Pressable
                                                    key={colorObj.hex}
                                                    onPress={() => setGoalColor(colorObj.hex)}
                                                    className={`w-10 h-10 rounded-full ml-2 border-2 ${colorObj.bgClass} ${goalColor === colorObj.hex ? 'border-white' : 'border-transparent'}`}
                                                    style={({ pressed }: { pressed: boolean }) => ({
                                                        opacity: pressed ? 0.8 : 1,
                                                        transform: [{ scale: pressed ? 0.92 : 1 }]
                                                    })}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleAddGoal}
                                    className="bg-[#10b981] p-4 rounded-xl items-center shadow-lg shadow-[#10b981]/20 mt-2"
                                >
                                    <Text className="text-[#050805] font-black tracking-wide text-lg">Create Goal</Text>
                                </TouchableOpacity>
                            </KeyboardAwareScrollView>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* App Usage Chart Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                statusBarTranslucent={true}
                visible={isAppUsageModalVisible}
                onRequestClose={() => setIsAppUsageModalVisible(false)}
            >
                <View className="flex-1 bg-black/70 justify-center px-4">
                    <View className="bg-[#141b14] rounded-3xl p-6 border border-gray-800">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">App Usage</Text>
                            <TouchableOpacity onPress={() => setIsAppUsageModalVisible(false)} className="bg-gray-800 p-2 rounded-full">
                                <Text className="text-white font-bold px-2">X</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 text-sm mb-6">Your daily screen time over the last 7 days.</Text>

                        <View className="flex-row justify-between items-end h-48 mt-2">
                            {renderWeeklyUsageChart()}
                        </View>
                    </View>
                </View>
            </Modal>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
                onCancel={hideAlert}
                showCancel={alertConfig.showCancel}
            />

        </LinearGradient>
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

const ChallengeCard = ({ id, title, subtitle, badge, progress, targetProgress, progressText, color, status, onDelete }: any) => {
    let badgeColor = color;
    let badgeBg = `${color}15`;
    let badgeBorder = `${color}30`;

    if (status === 'success') {
        badgeColor = '#10b981';
        badgeBg = '#10b98115';
        badgeBorder = '#10b98130';
    } else if (status === 'failed') {
        badgeColor = '#ef4444';
        badgeBg = '#ef444415';
        badgeBorder = '#ef444430';
    }

    return (
        <View className="bg-[#141b14] p-6 rounded-3xl border border-gray-900/50 mb-4">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-3">
                    <Text className="text-white text-xl font-bold">{title}</Text>
                    <Text className="text-gray-500 text-sm mt-1">{subtitle}</Text>
                </View>
                <View className="flex-row items-center">
                    <View style={{ backgroundColor: badgeBg, borderColor: badgeBorder }} className="px-3 py-1.5 rounded-full border mr-3">
                        <Text style={{ color: badgeColor }} className="text-xs font-bold uppercase tracking-wider">{badge}</Text>
                    </View>

                    {onDelete && (
                        <TouchableOpacity
                            onPress={() => onDelete(id, title)}
                            activeOpacity={0.7}
                        >
                            <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View className="mt-6">
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400 text-xs">Progress: {progress}%</Text>
                    <Text className="text-gray-400 text-xs">{progressText}</Text>
                </View>
                <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    {/* Target Progress Bar (Low Opacity) */}
                    {status === 'ongoing' && targetProgress !== undefined && (
                        <View
                            className="h-full absolute left-0 top-0"
                            style={{ width: `${targetProgress}%`, backgroundColor: color, opacity: 0.2 }}
                        />
                    )}
                    {/* Actual Progress Bar */}
                    <View
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                </View>
            </View>
        </View>
    );
};
