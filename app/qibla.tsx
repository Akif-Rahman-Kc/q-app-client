import { useLocationContext } from '@/contexts/LocationContext';
import { Coordinates, Qibla } from 'adhan';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { ChevronLeft, MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Calculate Qibla distance approximately
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const MAKKAH_LAT = 21.422487;
const MAKKAH_LON = 39.826206;

export default function QiblaScreen() {
    const router = useRouter();
    const { locationData } = useLocationContext();

    const [heading, setHeading] = useState<number>(0);
    const [errorText, setErrorText] = useState<string | null>(null);

    const compassHeading = useSharedValue(0);
    const qiblaArrowHeading = useSharedValue(0);
    const alignmentGlowOpacity = useSharedValue(0);
    const alignmentGlowScale = useSharedValue(1);

    const qiblaDirection = useMemo(() => {
        if (!locationData) return 0;
        const coords = new Coordinates(locationData.lat, locationData.lon);
        return Qibla(coords);
    }, [locationData]);

    const distance = useMemo(() => {
        if (!locationData) return 0;
        return getDistanceFromLatLonInKm(locationData.lat, locationData.lon, MAKKAH_LAT, MAKKAH_LON);
    }, [locationData]);

    useEffect(() => {
        let watchSubscription: Location.LocationSubscription | null = null;
        let magSubscription: any = null;

        const startHeadingSetup = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorText('Permission to access location was denied');
                return;
            }

            try {
                // Try watchHeadingAsync first (most accurate for compass)
                watchSubscription = await Location.watchHeadingAsync((headingData) => {
                    let { magHeading, trueHeading } = headingData;
                    // Use trueHeading if available, otherwise magHeading
                    let currentHeading = trueHeading >= 0 ? trueHeading : magHeading;
                    setHeading(currentHeading);
                });
            } catch (err) {
                // Fallback to Magnetometer if watchHeadingAsync fails/unsupported
                Magnetometer.setUpdateInterval(50);
                magSubscription = Magnetometer.addListener(data => {
                    let angle = Math.atan2(data.y, data.x) - Math.PI / 2;
                    let angleDeg = angle * (180 / Math.PI);
                    if (angleDeg < 0) {
                        angleDeg += 360;
                    }
                    setHeading(angleDeg);
                });
            }
        };

        startHeadingSetup();

        return () => {
            if (watchSubscription) {
                watchSubscription.remove();
            }
            if (magSubscription) {
                magSubscription.remove();
            }
        };
    }, []);

    // Calculate if we are pointing correctly at Qibla (tolerance of 5 degrees)
    let qiblaDiffValue = Math.abs(qiblaDirection - heading);
    if (qiblaDiffValue > 180) qiblaDiffValue = 360 - qiblaDiffValue;
    const isCorrectDirection = qiblaDiffValue < 5;

    useEffect(() => {
        // Smoothen the rotation
        // The image must rotate in the opposite direction of the heading to stay aligned with North
        // Calculate shortest path for rotation
        let angleDiff = -heading - compassHeading.value;
        // Normalize to -180...180
        angleDiff = ((angleDiff + 540) % 360) - 180;
        compassHeading.value = withSpring(compassHeading.value + angleDiff, { damping: 50, stiffness: 200 });

        // Qibla arrow relative to phone
        let rawQibla = qiblaDirection - heading;
        let qiblaDiff = rawQibla - qiblaArrowHeading.value;
        qiblaDiff = ((qiblaDiff + 540) % 360) - 180;
        qiblaArrowHeading.value = withSpring(qiblaArrowHeading.value + qiblaDiff, { damping: 50, stiffness: 200 });

        // Alignment Glow Animation
        if (isCorrectDirection) {
            alignmentGlowOpacity.value = withTiming(1, { duration: 300 });
            alignmentGlowScale.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1, // infinite
                true // reverse
            );
        } else {
            alignmentGlowOpacity.value = withTiming(0, { duration: 300 });
            alignmentGlowScale.value = withTiming(1, { duration: 300 });
        }

    }, [heading, qiblaDirection, isCorrectDirection]);

    const animatedCompassStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${compassHeading.value}deg` }],
        };
    });

    const animatedQiblaStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${qiblaArrowHeading.value}deg` }],
        };
    });

    const animatedGlowStyle = useAnimatedStyle(() => {
        return {
            opacity: alignmentGlowOpacity.value,
            transform: [{ scale: alignmentGlowScale.value }],
        };
    });


    return (
        <LinearGradient
            colors={['#0a0f0a', '#0f1a14', '#0a0f0a']}
            className="flex-1"
        >
            {/* <Stack.Screen options={{ headerShown: false }} /> */}

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={28} color="white" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-white font-bold text-xl">Qibla Finder</Text>
                </View>
                <View className="w-11" />
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-between pb-10">
                {!locationData ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text className="text-[#9ca3af] mt-4 text-base font-medium tracking-wide">Fetching Location...</Text>
                    </View>
                ) : errorText ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-red-500 text-base text-center px-8 leading-6">{errorText}</Text>
                    </View>
                ) : (
                    <>
                        <View className="items-center mt-2 w-full px-5">
                            <View className="flex-row items-center bg-[#1a241add] px-4 py-2.5 rounded-3xl border border-[#2d3a2d] mb-6 shadow-black shadow-md">
                                <MapPin size={16} color="#10b981" />
                                <Text className="text-white text-[15px] font-semibold ml-2 tracking-wide">{locationData.name}</Text>
                            </View>

                            <View className="flex-row items-center justify-center bg-[#0a0f0a99] py-4 px-8 rounded-3xl border border-[#1a241a]">
                                <View className="items-center px-5">
                                    <Text className="text-[#6b7280] text-xs font-semibold uppercase tracking-widest mb-1">Distance</Text>
                                    <Text className="text-white text-2xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>{distance.toFixed(0)} <Text className="text-[#10b981] text-sm font-semibold">km</Text></Text>
                                </View>
                                <View className="w-[1px] h-[30px] bg-[#2d3a2d]" />
                                <View className="items-center px-5">
                                    <Text className="text-[#6b7280] text-xs font-semibold uppercase tracking-widest mb-1">Angle</Text>
                                    <Text className="text-white text-2xl font-extrabold" style={{ fontVariant: ['tabular-nums'] }}>{qiblaDirection.toFixed(1)}<Text className="text-[#10b981] text-sm font-semibold">°</Text></Text>
                                </View>
                            </View>
                        </View>

                        {/* Compass Area */}
                        <View className="items-center justify-center relative my-5" style={{ width: compassSize, height: compassSize }}>
                            {/* Outer Glow when aligned */}
                            <Animated.View style={[animatedGlowStyle, { position: 'absolute', width: compassSize + 60, height: compassSize + 60, borderRadius: (compassSize + 60) / 2 }]}>
                                <LinearGradient
                                    colors={['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.0)']}
                                    style={StyleSheet.absoluteFillObject}
                                    start={{ x: 0.5, y: 0.5 }}
                                    end={{ x: 1, y: 1 }}
                                    className="rounded-full"
                                />
                            </Animated.View>

                            {/* Outer Bezel */}
                            <View
                                className="bg-[#0a0f0a] border-4 border-[#1f2922] items-center justify-center overflow-hidden shadow-[#10b981] shadow-xl absolute"
                                style={{ width: compassSize, height: compassSize, borderRadius: compassSize / 2, elevation: 10 }}
                            >
                                {/* Inner Dial Background */}
                                <LinearGradient
                                    colors={['#1a241a', '#0a0f0a']}
                                    style={[StyleSheet.absoluteFillObject, { borderRadius: compassSize / 2, opacity: 0.5 }]}
                                />

                                {/* Rotating Compass Dial */}
                                <Animated.View className="items-center justify-center absolute" style={[{ width: compassSize, height: compassSize, borderRadius: compassSize / 2 }, animatedCompassStyle]}>
                                    {/* Tick Marks & Degrees */}
                                    {[...Array(72)].map((_, i) => {
                                        const isCardinal = i % 18 === 0;
                                        const isMajor = i % 6 === 0 && !isCardinal;
                                        const degree = i * 5;

                                        let cardinalLetter = '';
                                        if (degree === 0) cardinalLetter = 'N';
                                        if (degree === 90) cardinalLetter = 'E';
                                        if (degree === 180) cardinalLetter = 'S';
                                        if (degree === 270) cardinalLetter = 'W';

                                        return (
                                            <View
                                                key={`tick-${i}`}
                                                className="absolute items-center justify-center w-[30px] h-[30px]"
                                                style={[{ transform: [{ rotate: `${degree}deg` }, { translateY: -(compassSize - 40) / 2 }] }]}
                                            >
                                                {isCardinal ? (
                                                    <View className="items-center justify-center w-[30px] h-[30px]" style={[{ transform: [{ rotate: `-${degree}deg` }] }]}>
                                                        <Text className={`text-[22px] font-extrabold ${cardinalLetter === 'N' ? 'text-red-500' : 'text-[#9ca3af]'}`}>
                                                            {cardinalLetter}
                                                        </Text>
                                                    </View>
                                                ) : isMajor ? (
                                                    <View className="w-[3px] h-3 bg-[#4b5563] rounded-sm" />
                                                ) : (
                                                    <View className="w-[1px] h-2 bg-[#374151]" />
                                                )}
                                            </View>
                                        );
                                    })}

                                    {/* North Accent Triangle inside dial */}
                                    <View className="absolute top-[45px] w-0 h-0 bg-transparent border-solid border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500" />
                                </Animated.View>

                                {/* Qibla Indicator (Kaaba/Arrow) */}
                                <Animated.View className="w-[50px] items-center absolute justify-start" style={[{ height: compassSize }, animatedQiblaStyle]}>
                                    <View className="w-[2px] bg-[#10b981] absolute top-[50px] opacity-60 border-dashed" style={{ height: compassSize / 2 - 50 }} />
                                    <View className={`w-12 h-12 rounded-full items-center justify-center mt-1.5 border-2 ${isCorrectDirection ? 'bg-[#10b981] border-white shadow-lg opacity-80' : 'bg-[#1a241a] border-[#10b981] shadow-md shadow-[#10b981]'} elevation-8`}>
                                        {/* Kaaba Representation */}
                                        <View className="w-[18px] h-[20px] bg-[#0a0f0a] items-center relative border border-[#d4af37] rounded-sm">
                                            <View className="absolute bottom-0 right-[3px] w-1 h-[9px] bg-[#d4af37] rounded-t-sm" />
                                            <View className="absolute top-[5px] w-full h-[2px] bg-[#d4af37]" />
                                        </View>
                                    </View>
                                </Animated.View>

                                {/* Center Dot */}
                                <View className={`w-6 h-6 rounded-full items-center justify-center border absolute shadow-black shadow-md ${isCorrectDirection ? 'bg-[#1a241a] border-[#10b981] shadow-[#10b981]/40' : 'bg-[#1a241a] border-[#374151]'}`}>
                                    <View className={`w-2 h-2 rounded-full ${isCorrectDirection ? 'bg-[#10b981]' : 'bg-[#4b5563]'}`} />
                                </View>
                            </View>
                        </View>

                        {/* Bottom Status */}
                        <View className={`py-3.5 px-7 mt-4 rounded-full border ${isCorrectDirection ? 'bg-[#10b98126] border-[#10b981]' : 'bg-[#1a241acc] border-[#2d3a2d]'}`}>
                            <Text className={`text-[15px] tracking-wide ${isCorrectDirection ? 'text-[#10b981] font-bold' : 'text-[#9ca3af] font-semibold'}`}>
                                {isCorrectDirection ? "Alhamdulillah! You are facing the Qibla." : "Point the Kaaba icon to the top"}
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </LinearGradient>
    );
}

const compassSize = width * 0.85;
