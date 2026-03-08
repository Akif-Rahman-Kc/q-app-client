import { OfflineNotice } from '@/components/offline-notice';
import { useLocationContext } from '@/contexts/LocationContext';
import { useConnectivity } from '@/hooks/use-connectivity';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Compass, MapPin, Moon, RefreshCw, Sun, Sunrise, Sunset } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

const TimerBox = ({ value, label, active }: { value: string, label: string, active?: boolean }) => (
    <View className="items-center">
        <View className={`${active ? 'bg-[#10b981]' : 'bg-[#10b98115] border border-[#10b98130]'} w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] items-center justify-center`}>
            <Text className={`${active ? 'text-[#050805]' : 'text-[#10b981]'} font-bold text-xl sm:text-2xl`}>{value}</Text>
        </View>
        <Text className="text-gray-500 font-bold text-[10px] sm:text-[11px] mt-2 tracking-wide lowercase">{label}</Text>
    </View>
);

const PrayerCard = ({ icon, name, sub, time, muted }: { icon: React.ReactNode, name: string, sub: string, time: string, muted?: boolean }) => (
    <View className="bg-[#141b14] flex-row items-center justify-between p-4 sm:p-5 rounded-[24px] mb-3 border border-gray-900/50 shadow-sm">
        <View className="flex-row items-center">
            <View className="mr-3 sm:mr-4">{icon}</View>
            <View>
                <Text className="text-white font-bold text-[16px] sm:text-lg">{name}</Text>
                <Text className="text-gray-500 text-[11px] sm:text-xs tracking-wide">{sub}</Text>
            </View>
        </View>
        <View className="flex-row items-center">
            <Text className="text-white font-bold text-[16px] sm:text-lg mr-3 sm:mr-4">{time}</Text>
            {/* {muted ? <BellOff size={20} color="#4b5563" /> : <Bell size={20} color="#10b981" />} */}
        </View>
    </View>
);

export default function PrayersScreen() {
    const router = useRouter();
    const { locationData, isLoading: isLocationLoading, refreshCurrentLocation } = useLocationContext();
    const isConnected = useConnectivity();

    const [prayerTimesObj, setPrayerTimesObj] = useState<PrayerTimes | null>(null);
    const [dailyPrayers, setDailyPrayers] = useState<any[]>([]);
    const [hijriDate, setHijriDate] = useState<string>('Loading...');
    const [sunsetTime, setSunsetTime] = useState<string>('--:--');
    const [sunriseTime, setSunriseTime] = useState<string>('--:--');

    // Countdown State
    const [nextPrayerName, setNextPrayerName] = useState<string>('Fajr');
    const [countdownData, setCountdownData] = useState({ hours: '00', mins: '00', secs: '00' });
    const [countdownString, setCountdownString] = useState<string>('--:--:--');

    const fetchHijriDate = async (lat: number, lon: number) => {
        if (!isConnected) {
            setHijriDate('Offline');
            return;
        }
        try {
            const isSouthAsia = lon >= 60 && lon <= 100;
            const offsetDays = isSouthAsia ? 1 : 0;
            const dateStr = dayjs().subtract(offsetDays, 'day').format('DD-MM-YYYY');
            const response = await fetch(`https://api.aladhan.com/v1/gToH/${dateStr}`);
            const data = await response.json();
            if (data.data && data.data.hijri) {
                const h = data.data.hijri;
                setHijriDate(`${dayjs().format('dddd, D MMM')} | ${h.day} ${h.month.en}`);
            }
        } catch (error) {
            const islamicDate = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', { day: 'numeric', month: 'long' }).format(new Date());
            setHijriDate(`${dayjs().format('dddd, D MMM')} | ${islamicDate}`);
        }
    };

    const calculatePrayers = () => {
        if (!locationData) return;
        try {
            const coords = new Coordinates(locationData.lat, locationData.lon);
            const params = CalculationMethod.Karachi();
            const date = new Date();
            const pTimes = new PrayerTimes(coords, date, params);

            setPrayerTimesObj(pTimes);
            setSunsetTime(dayjs(pTimes.maghrib).format('hh:mm A'));
            setSunriseTime(dayjs(pTimes.sunrise).format('hh:mm A'));

            setDailyPrayers([
                { id: 'fajr', name: 'Fajr', sub: 'Dawn', time: dayjs(pTimes.fajr).format('hh:mm A'), icon: <Sunrise size={24} color="#9ca3af" /> },
                { id: 'dhuhr', name: 'Dhuhr', sub: 'Noon', time: dayjs(pTimes.dhuhr).format('hh:mm A'), icon: <Sun size={24} color="#9ca3af" /> },
                { id: 'asr', name: 'Asr', sub: 'Afternoon', time: dayjs(pTimes.asr).format('hh:mm A'), icon: <Sun size={24} color="#9ca3af" /> },
                { id: 'maghrib', name: 'Maghrib', sub: 'Sunset', time: dayjs(pTimes.maghrib).format('hh:mm A'), icon: <Moon size={24} color="#9ca3af" /> },
                { id: 'isha', name: 'Isha', sub: 'Night', time: dayjs(pTimes.isha).format('hh:mm A'), icon: <Moon size={24} color="#9ca3af" /> },
            ]);

            fetchHijriDate(locationData.lat, locationData.lon);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (locationData) {
            calculatePrayers();
        }
    }, [locationData, isConnected]);

    const updateCountdown = useCallback(() => {
        if (!prayerTimesObj) return;

        let next = prayerTimesObj.nextPrayer();

        // Skip Sunrise for next prayer countdown
        if (next === 'sunrise') {
            next = 'dhuhr';
        }

        if (next === 'none' || !next) {
            setNextPrayerName('Fajr');
            setCountdownData({ hours: '00', mins: '00', secs: '00' });
            setCountdownString('Upcoming');
            return;
        }

        const nextName = next.charAt(0).toUpperCase() + next.slice(1);
        setNextPrayerName(nextName);

        const nextTime = prayerTimesObj.timeForPrayer(next);
        if (nextTime) {
            const diffTotalSeconds = dayjs(nextTime).diff(dayjs(), 'second');

            if (diffTotalSeconds < 0) {
                if (locationData) calculatePrayers();
                return;
            }

            const h = Math.floor(diffTotalSeconds / 3600);
            const m = Math.floor((diffTotalSeconds % 3600) / 60);
            const s = diffTotalSeconds % 60;

            const format = (val: number) => val.toString().padStart(2, '0');
            setCountdownData({ hours: format(h), mins: format(m), secs: format(s) });
            setCountdownString(`in ${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
        }
    }, [prayerTimesObj, locationData]);

    useEffect(() => {
        const interval = setInterval(() => {
            updateCountdown();
        }, 1000);
        return () => clearInterval(interval);
    }, [updateCountdown]);

    const loading = isLocationLoading || dailyPrayers.length === 0;

    if (loading) {
        return (
            <View className="flex-1 bg-[#050805] items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#050805]">
            <StatusBar barStyle="light-content" />

            {/* Top Header Section */}
            <ImageBackground
                source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfYUPhoGEn6XnYE-L6yTT-Ht-0wJ8qwYn5lw&s' }}
                className="h-[380px] w-full"
                imageStyle={{ opacity: 0.3 }}
            >
                <LinearGradient
                    colors={['rgba(5,8,5,0.2)', 'rgba(5,8,5,1)']}
                    className="flex-1 px-6 pt-14"
                >
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity onPress={refreshCurrentLocation} className="flex-row items-center bg-[#1a2e1a] px-4 py-2.5 rounded-full border border-[#2d3a2d] max-w-[80%]">
                            <MapPin size={16} color="#10b981" />
                            <Text className="text-white font-bold text-[11px] ml-2 uppercase tracking-widest" numberOfLines={1}>
                                {locationData?.name || 'Detecting...'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={refreshCurrentLocation} className="bg-[#1a2e1a] p-2.5 rounded-full border border-[#2d3a2d] backdrop-blur-sm">
                            <RefreshCw size={21} color="#10b981" />
                        </TouchableOpacity>
                    </View>

                    {!isConnected && <OfflineNotice />}

                    {/* Current Info */}
                    <View className="items-center">
                        <Text className="text-gray-300 text-[13px] font-semibold tracking-wide mb-3">{hijriDate}</Text>

                        <View className="flex-row items-center justify-center">
                            <View className="flex-row items-center bg-[#ffffff10] px-3 py-1 rounded-full border border-[#ffffff15]">
                                <Sunrise size={12} color="#facc15" />
                                <Text className="text-gray-300 text-[11px] font-bold tracking-wider ml-1.5 uppercase">Sunrise {sunriseTime}</Text>
                            </View>
                            <View className="w-1 h-1 rounded-full bg-[#10b981] mx-2" />
                            <View className="flex-row items-center bg-[#ffffff10] px-3 py-1 rounded-full border border-[#ffffff15]">
                                <Sunset size={12} color="#facc15" />
                                <Text className="text-gray-300 text-[11px] font-bold tracking-wider ml-1.5 uppercase">Sunset {sunsetTime}</Text>
                            </View>
                        </View>

                        <Text className="text-white text-5xl font-black tracking-tight mt-4">{nextPrayerName}</Text>

                        {/* Countdown Timer */}
                        <View className="flex-row mt-6 space-x-3 gap-3">
                            <TimerBox value={countdownData.hours} label="h" />
                            <TimerBox value={countdownData.mins} label="m" active />
                            <TimerBox value={countdownData.secs} label="s" />
                        </View>

                        <Text className="text-[#10b981] font-bold mt-7 tracking-wide text-[13px]">
                            Next Prayer {countdownString}
                        </Text>
                    </View>
                </LinearGradient>
            </ImageBackground>

            {/* Prayer List */}
            <ScrollView className="flex-1 px-5 -mt-6" showsVerticalScrollIndicator={false}>
                {dailyPrayers.map((prayer) => {
                    const isNext = nextPrayerName.toLowerCase() === prayer.id.toLowerCase();
                    const isMuted = dayjs(prayerTimesObj?.[prayer.id as keyof PrayerTimes] as Date).isBefore(dayjs());

                    if (isNext) {
                        return (
                            <View key={prayer.id} className="bg-[#10b981] flex-row items-center justify-between p-5 rounded-[28px] mb-3 shadow-lg shadow-[#10b981]/20">
                                <View className="flex-row items-center">
                                    <View className="bg-[#ffffff30] p-3 rounded-[18px] mr-4">
                                        {React.cloneElement(prayer.icon as React.ReactElement<any>, { color: 'white', size: 28 })}
                                    </View>
                                    <View>
                                        <Text className="text-[#050805] font-black text-[22px] tracking-tight">{prayer.name}</Text>
                                        <Text className="text-[#050805] text-[11px] font-black opacity-60 tracking-wider mt-0.5">NEXT PRAYER</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-[#050805] font-black text-xl mr-4">{prayer.time}</Text>
                                    {/* <Bell size={24} color="#050805" /> */}
                                </View>
                            </View>
                        );
                    }

                    return (
                        <PrayerCard
                            key={prayer.id}
                            icon={prayer.icon}
                            name={prayer.name}
                            sub={prayer.sub}
                            time={prayer.time}
                            muted={isMuted}
                        />
                    );
                })}

                {/* Qibla Button */}
                <TouchableOpacity onPress={() => router.push('/qibla')} className="mt-4 mb-12">
                    <View className="bg-[#10b98115] border border-[#10b98140] flex-row items-center justify-center py-5 rounded-[24px]">
                        <Compass size={22} color="#10b981" />
                        <Text className="text-[#10b981] font-bold text-[16px] tracking-wide ml-3">Find Qibla Direction</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
