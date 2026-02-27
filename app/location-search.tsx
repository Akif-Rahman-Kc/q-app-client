import { Colors } from '@/constants/theme';
import { useLocationContext } from '@/contexts/LocationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useConnectivity } from '@/hooks/use-connectivity';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, Search } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

export default function LocationSearchScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const isConnected = useConnectivity();

    const { locationData, setManualCoordinates, setManualLocation } = useLocationContext();
    const mapRef = useRef<MapView>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // State for the currently selected pin on the map
    const [selectedCoord, setSelectedCoord] = useState<{ lat: number, lon: number } | null>(
        locationData ? { lat: locationData.lat, lon: locationData.lon } : null
    );
    const [previewName, setPreviewName] = useState<string>(locationData ? locationData.name : 'Choose a location');

    // Initial map region
    const [region, setRegion] = useState<Region>({
        latitude: locationData ? locationData.lat : 13.0827,
        longitude: locationData ? locationData.lon : 80.2707,
        latitudeDelta: 5.0,
        longitudeDelta: 5.0,
    });

    useEffect(() => {
        if (locationData && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: locationData.lat,
                longitude: locationData.lon,
                latitudeDelta: 1.0,
                longitudeDelta: 1.0,
            }, 1000);
        }
    }, []);

    const handleMapPress = async (e: MapPressEvent) => {
        if (!isConnected) return;
        const { coordinate } = e.nativeEvent;
        setSelectedCoord({ lat: coordinate.latitude, lon: coordinate.longitude });
        setIsSearching(true);

        try {
            const reverse = await Location.reverseGeocodeAsync({ latitude: coordinate.latitude, longitude: coordinate.longitude });
            if (reverse[0]) {
                const r = reverse[0];
                const locName = `${r.city || r.district || r.subregion || r.name || 'Unknown Location'}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
                setPreviewName(locName);
            } else {
                setPreviewName('Unknown Location');
            }
        } catch (error) {
            setPreviewName('Selected Location');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = async () => {
        if (!searchQuery.trim() || !isConnected) return;
        Keyboard.dismiss();
        setIsSearching(true);

        try {
            const geocoded = await Location.geocodeAsync(searchQuery);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                setSelectedCoord({ lat: latitude, lon: longitude });

                const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
                let locName = searchQuery;
                if (reverse[0]) {
                    const r = reverse[0];
                    locName = `${r.city || r.district || r.name || searchQuery}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
                }
                setPreviewName(locName);

                mapRef.current?.animateToRegion({
                    latitude,
                    longitude,
                    latitudeDelta: 0.5,
                    longitudeDelta: 0.5,
                }, 1000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCurrentLocationPress = async () => {
        if (!isConnected) return;
        setIsSearching(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const { latitude, longitude } = loc.coords;
            setSelectedCoord({ lat: latitude, lon: longitude });

            const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
            let locName = 'Current Location';
            if (reverse[0]) {
                const r = reverse[0];
                locName = `${r.city || r.district || r.subregion || r.name || 'Unknown Location'}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
            }
            setPreviewName(locName);

            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };


    const confirmLocation = async () => {
        if (!selectedCoord) return;
        setIsSearching(true);
        const success = await setManualCoordinates(selectedCoord.lat, selectedCoord.lon);
        setIsSearching(false);
        if (success) {
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
            >
                {selectedCoord && (
                    <Marker
                        coordinate={{ latitude: selectedCoord.lat, longitude: selectedCoord.lon }}
                        title={previewName}
                    />
                )}
            </MapView>

            {/* Top Search Bar Overlay */}
            <View className="absolute top-12 left-5 right-5 z-10">
                <View className="flex-row items-center rounded-2xl px-4 py-1 shadow-md elevation-5" style={{ backgroundColor: theme.card }}>
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-1">
                        <ArrowLeft size={20} color={theme.text} />
                    </TouchableOpacity>
                    <Search size={18} color={theme.icon} />
                    <TextInput
                        className="flex-1 py-3 px-3 text-base"
                        placeholder="Search city..."
                        placeholderTextColor={theme.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                        style={{ color: theme.text }}
                    />
                    {isSearching && <ActivityIndicator size="small" color={theme.primary} />}
                </View>
                {!isConnected && (
                    <View className="mt-2 bg-red-500 rounded-xl p-2 px-4 opacity-90">
                        <Text className="text-white text-xs font-bold text-center">No internet connection. Map search disabled.</Text>
                    </View>
                )}
            </View>

            {/* Current Location FAB */}
            <TouchableOpacity
                onPress={handleCurrentLocationPress}
                disabled={isSearching || !isConnected}
                className="absolute right-5 z-10 w-[54px] h-[54px] rounded-full items-center justify-center shadow-lg elevation-4"
                style={{ bottom: 220, backgroundColor: theme.card }}
            >
                {isSearching ? <ActivityIndicator size="small" color={theme.primary} /> : <Navigation size={24} color={theme.primary} />}
            </TouchableOpacity>

            {/* Bottom Confirmation Sheet Overlay */}
            <View className="absolute bottom-8 left-5 right-5 z-10 shadow-lg elevation-5 bg-white rounded-3xl p-5" style={{ backgroundColor: theme.card }}>
                <Text className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.icon }}>Selected Location</Text>

                <View className="flex-row items-center mb-6">
                    <View className="w-10 h-10 rounded-full justify-center items-center mr-3" style={{ backgroundColor: theme.primary + '15' }}>
                        <MapPin size={20} color={theme.primary} />
                    </View>
                    <Text className="flex-1 text-lg font-bold" style={{ color: theme.text }} numberOfLines={2}>
                        {previewName}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={confirmLocation}
                    disabled={isSearching || !selectedCoord || !isConnected}
                    className="p-4 rounded-[20px] items-center justify-center flex-row"
                    style={{
                        backgroundColor: (!selectedCoord || !isConnected) ? theme.border : theme.primary,
                        opacity: isSearching ? 0.7 : 1
                    }}
                >
                    <Text className="text-white text-base font-bold">
                        {isSearching ? 'Saving...' : 'Confirm Location'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
