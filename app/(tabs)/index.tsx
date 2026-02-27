import { OfflineNotice } from '@/components/offline-notice';
import { useLocationContext } from '@/contexts/LocationContext';
import { useConnectivity } from '@/hooks/use-connectivity';
import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useRouter } from 'expo-router';
import { Bell, BookOpen, Bookmark, Compass, Copy, Landmark, MapPin, RefreshCw } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ActionCard = ({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) => (
  <TouchableOpacity className="bg-[#141b14] w-[48%] rounded-[24px] p-5 mb-4 border border-gray-900 shadow-sm">
    <View className="bg-[#0a0f0a] w-12 h-12 rounded-2xl items-center justify-center mb-6">
      {icon}
    </View>
    <Text className="text-white font-bold text-[17px] mb-1">{title}</Text>
    <Text className="text-gray-500 text-[12px] font-medium">{sub}</Text>
  </TouchableOpacity>
);

export default function TodayScreen() {
  const router = useRouter();

  const { locationData, isLoading: isLocationLoading, refreshCurrentLocation } = useLocationContext();

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; countdown: string } | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('Loading...');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const isConnected = useConnectivity();

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
        setHijriDate(`${h.day} ${h.month.en} ${h.year}`);
      }
    } catch (error) {
      const date = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
      setHijriDate(date);
    }
  };

  const updateNextPrayer = useCallback((times: PrayerTimes) => {
    let next = times.nextPrayer();

    // Skip Sunrise so the next prayer goes directly from Fajr to Dhuhr
    if (next === 'sunrise') {
      next = 'dhuhr';
    }

    if (next === 'none' || !next) {
      setNextPrayer({
        name: 'Fajr',
        time: '--:--',
        countdown: 'Upcoming'
      });
      return;
    }
    const nextName = next.charAt(0).toUpperCase() + next.slice(1);
    const nextTime = times.timeForPrayer(next);

    if (nextTime) {
      const diffTotalSeconds = dayjs(nextTime).diff(dayjs(), 'second');

      if (diffTotalSeconds < 0) {
        if (locationData) {
          calculatePrayers(locationData.lat, locationData.lon);
        }
        return;
      }

      const hours = Math.floor(diffTotalSeconds / 3600);
      const mins = Math.floor((diffTotalSeconds % 3600) / 60);
      const secs = diffTotalSeconds % 60;

      setNextPrayer({
        name: nextName,
        time: dayjs(nextTime).format('hh:mm A'),
        countdown: `in ${hours > 0 ? hours + 'h ' : ''}${mins}m ${secs}s`
      });
    }
  }, [prayerTimes, locationData]);

  const calculatePrayers = (lat: number, lon: number) => {
    const coords = new Coordinates(lat, lon);
    const params = CalculationMethod.Karachi();
    const date = new Date();
    const times = new PrayerTimes(coords, date, params);
    setPrayerTimes(times);
    updateNextPrayer(times);
  };

  const loadDataForLocation = async () => {
    if (!locationData) return;
    setIsDataLoading(true);
    calculatePrayers(locationData.lat, locationData.lon);
    await fetchHijriDate(locationData.lat, locationData.lon);
    setIsDataLoading(false);
  };

  useEffect(() => {
    if (locationData) {
      loadDataForLocation();
    }
  }, [locationData, isConnected]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerTimes) {
        updateNextPrayer(prayerTimes);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, updateNextPrayer]);

  const loading = isLocationLoading || isDataLoading;

  const nextPrayerNameRaw = prayerTimes ? prayerTimes.nextPrayer() : 'none';

  return (
    <View className="flex-1 pt-14 bg-[#0a0f0a]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 mb-4">
        <TouchableOpacity onPress={() => router.push('/location-search')} className="flex-row items-center flex-1">
          <MapPin size={22} color="#10b981" />
          <View className="ml-3 flex-1">
            <Text className="text-white font-bold text-[14px]" numberOfLines={1}>
              {locationData ? locationData.name : 'Detecting...'}
            </Text>
            <Text className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5 font-semibold">
              {locationData?.isManual ? 'Selected Location' : 'Updated just now'}
            </Text>
          </View>
        </TouchableOpacity>
        <View className="flex-row gap-4 ml-4">
          <TouchableOpacity onPress={() => refreshCurrentLocation()} className="p-2.5 rounded-full bg-[#1a241a] border border-[#2d3a2d]">
            <RefreshCw size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2.5 rounded-full bg-[#1a241a] border border-[#2d3a2d]">
            <Bell size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-2">
        {!isConnected && (
          <View className="mb-4">
            <OfflineNotice />
          </View>
        )}

        {/* Greeting Section */}
        <View className="mb-5">
          <Text
            className="text-[#10b981] text-[40px] leading-[60px] text-center"
            style={{ fontFamily: 'System', writingDirection: 'rtl' }}
          >
            ٱلسَّلَامُ عَلَيْكُمْ
          </Text>
          <Text className="text-gray-400 font-bold tracking-[4px] text-[11px] uppercase mt-0.5 text-center">
            Assalamu Alaikum
          </Text>
        </View>

        {/* Main Prayer Card */}
        <View className="bg-[#1a241a] rounded-[32px] p-6 mb-8 border border-[#2d3a2d] shadow-lg">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 mr-4">
              <Text className="text-[#10b981] font-bold tracking-widest text-[12px] mb-1 uppercase">
                {hijriDate.includes('Ramadan') || hijriDate.includes('Ramadhan') ? 'RAMADHAN KAREEM' : 'HIJRI DATE'}
              </Text>
              {loading && hijriDate === 'Loading...' ? (
                <ActivityIndicator color="#10b981" className="mt-2 text-left" style={{ alignSelf: 'flex-start' }} />
              ) : (
                <Text className="text-white font-bold text-2xl tracking-tight leading-8 flex-wrap">
                  {hijriDate}
                </Text>
              )}
            </View>
            <View className="bg-[#10b98120] px-3.5 py-1.5 rounded-full border border-[#10b981] mt-1 flex-shrink-0">
              <Text className="text-[#10b981] font-bold text-[11px] uppercase tracking-wider">Live</Text>
            </View>
          </View>

          <Text className="text-gray-400 mt-5 font-semibold text-[15px]">Next Prayer</Text>
          <View className="flex-row items-baseline mt-1 mb-1">
            <Text className="text-white font-bold text-[32px] tracking-tight">
              {nextPrayer ? nextPrayer.name : '--'}
            </Text>
            <Text className="text-[#10b981] font-bold text-[16px] ml-3">
              {nextPrayer ? nextPrayer.countdown : '--:--:--'}
            </Text>
          </View>
          <Text className="text-gray-500 text-[14px] font-medium mb-7">
            Scheduled for {nextPrayer ? nextPrayer.time : '--:--'}
          </Text>

          {/* Prayer Timeline */}
          <View className="flex-row justify-between items-center bg-[#0a0f0a] border border-[#2d3a2d] p-2 rounded-[20px]">
            {(() => {
              const allPrayers = [
                { id: 'fajr', name: 'FAJR', time: prayerTimes ? dayjs(prayerTimes.fajr).format('H:mm') : '--:--' },
                { id: 'dhuhr', name: 'DHUHR', time: prayerTimes ? dayjs(prayerTimes.dhuhr).format('H:mm') : '--:--' },
                { id: 'asr', name: 'ASR', time: prayerTimes ? dayjs(prayerTimes.asr).format('H:mm') : '--:--' },
                { id: 'maghrib', name: 'MAGHRIB', time: prayerTimes ? dayjs(prayerTimes.maghrib).format('H:mm') : '--:--' },
                { id: 'isha', name: 'ISHA', time: prayerTimes ? dayjs(prayerTimes.isha).format('H:mm') : '--:--' }
              ];

              const currentIndex = nextPrayer
                ? allPrayers.findIndex(p => p.name.toLowerCase() === nextPrayer.name.toLowerCase())
                : -1;

              let displayPrayers = [];
              if (currentIndex === -1 || !prayerTimes) {
                displayPrayers = allPrayers.slice(0, 3);
              } else if (currentIndex === 0) {
                displayPrayers = [allPrayers[allPrayers.length - 1], allPrayers[0], allPrayers[1]];
              } else if (currentIndex === allPrayers.length - 1) {
                displayPrayers = [allPrayers[allPrayers.length - 2], allPrayers[allPrayers.length - 1], allPrayers[0]];
              } else {
                displayPrayers = allPrayers.slice(currentIndex - 1, currentIndex + 2);
              }

              return displayPrayers.map((p) => {
                const isCenter = p.name.toLowerCase() === nextPrayer?.name.toLowerCase();
                return (
                  <View key={p.id} className={`flex-1 items-center px-1.5 ${isCenter ? 'py-2 bg-[#10b981] rounded-[16px]' : 'py-1'}`}>
                    <Text className={`tracking-widest font-extrabold mb-0.5 ${isCenter ? 'text-[10px] text-[#0a0f0a]' : 'text-[9px] text-gray-500'}`}>{p.name}</Text>
                    <Text className={`font-bold ${isCenter ? 'text-[15px] text-[#0a0f0a]' : 'text-[12px] text-gray-400'}`}>{p.time}</Text>
                  </View>
                )
              });
            })()}
          </View>
        </View>

        {/* Quick Actions Header */}
        <View className="flex-row justify-between items-center mb-5 px-1">
          <Text className="text-white font-extrabold text-[22px]">Quick Actions</Text>
          <TouchableOpacity><Text className="text-[#10b981] font-bold text-[15px]">Edit</Text></TouchableOpacity>
        </View>

        {/* Actions Grid */}
        <View className="flex-row flex-wrap justify-between">
          <ActionCard icon={<BookOpen size={22} color="#10b981" />} title="Last Read" sub="Al-Baqarah: 255" />
          <ActionCard icon={<Bookmark size={22} color="#facc15" />} title="Bookmarks" sub="12 Saved Ayats" />
          <ActionCard icon={<Compass size={22} color="#10b981" />} title="Qibla Finder" sub="291.5° NW" />
          <ActionCard icon={<Landmark size={22} color="#facc15" />} title="Zakat" sub="Calculator & Pay" />
        </View>

        {/* Ayat of the Day */}
        <View className="bg-[#1a241a] rounded-[32px] p-7 mt-4 mb-12 border border-[#2d3a2d] shadow-lg">
          <View className="flex-row items-center mb-5">
            <Text className="text-yellow-500 mr-2.5 text-[16px]">✦</Text>
            <Text className="text-gray-400 font-extrabold tracking-[2px] text-[10px]">AYAT OF THE DAY</Text>
          </View>
          <Text className="text-white text-[16px] font-medium italic leading-8 mb-7">
            "So remember Me; I will remember you. And be grateful to Me and do not deny Me."
          </Text>
          <View className="h-[1px] bg-[#2d3a2d] mb-5" />
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 font-bold text-[12px]">Al-Baqarah 2:152</Text>
            <View className="flex-row gap-5">
              {/* <TouchableOpacity><Share2 size={20} color="#6b7280" /></TouchableOpacity> */}
              <TouchableOpacity><Copy size={20} color="#6b7280" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
