import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type LocationData = {
    lat: number;
    lon: number;
    name: string;
    isManual: boolean;
};

type LocationContextType = {
    locationData: LocationData | null;
    isLoading: boolean;
    error: string | null;
    refreshCurrentLocation: () => Promise<void>;
    setManualLocation: (query: string) => Promise<boolean>;
    setManualCoordinates: (lat: number, lon: number) => Promise<boolean>;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const CHENNAI_DEFAULT: LocationData = {
    lat: 13.0827,
    lon: 80.2707,
    name: 'Chennai, Tamil Nadu',
    isManual: false,
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [locationData, setLocationData] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSavedLocation();
    }, []);

    const loadSavedLocation = async () => {
        try {
            const saved = await AsyncStorage.getItem('@user_location');
            if (saved) {
                setLocationData(JSON.parse(saved));
                setIsLoading(false);
            } else {
                await refreshCurrentLocation();
            }
        } catch (e) {
            await refreshCurrentLocation();
        }
    };

    const saveLocation = async (data: LocationData) => {
        setLocationData(data);
        await AsyncStorage.setItem('@user_location', JSON.stringify(data));
    };

    const refreshCurrentLocation = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                await saveLocation(CHENNAI_DEFAULT);
                setError('Permission denied, using default location.');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            let reverse = await Location.reverseGeocodeAsync(loc.coords);
            let locName = 'Unknown Location';
            if (reverse[0]) {
                const r = reverse[0];
                locName = `${r.city || r.district || r.subregion || 'Unknown'}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
            }

            await saveLocation({
                lat: loc.coords.latitude,
                lon: loc.coords.longitude,
                name: locName,
                isManual: false,
            });
        } catch (e) {
            await saveLocation(CHENNAI_DEFAULT);
            setError('Failed to get current location.');
        } finally {
            setIsLoading(false);
        }
    };

    const setManualLocation = async (query: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const geocoded = await Location.geocodeAsync(query);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });

                let locName = query; // Fallback
                if (reverse[0]) {
                    const r = reverse[0];
                    locName = `${r.city || r.district || r.subregion || r.name || query}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
                }

                await saveLocation({
                    lat: latitude,
                    lon: longitude,
                    name: locName,
                    isManual: true,
                });
                return true;
            } else {
                setError('Location not found. Please try another search.');
                return false;
            }
        } catch (e) {
            setError('Failed to search location.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const setManualCoordinates = async (lat: number, lon: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });

            let locName = 'Unknown Map Location';
            if (reverse[0]) {
                const r = reverse[0];
                locName = `${r.city || r.district || r.subregion || r.name || 'Unknown Location'}, ${r.region || r.country || ''}`.replace(/,\s*$/, '');
            }

            await saveLocation({
                lat,
                lon,
                name: locName,
                isManual: true,
            });
            return true;
        } catch (e) {
            setError('Failed to fetch location details from map pin.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{ locationData, isLoading, error, refreshCurrentLocation, setManualLocation, setManualCoordinates }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocationContext() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocationContext must be used within a LocationProvider');
    }
    return context;
}
