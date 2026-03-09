import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { LocationProvider } from '@/contexts/LocationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { checkAndUpdateStreak, recordAppUsageSession } from '@/utils/profile-stats';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef(AppState.currentState);
  const sessionStartTime = useRef<number | null>(null);

  useEffect(() => {
    // Hide the splash screen after a 2.5-second delay to show the intro image
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 2500));
      await SplashScreen.hideAsync();
    };

    hideSplash();

    checkAndUpdateStreak();

    if (appState.current === 'active') {
      sessionStartTime.current = Date.now();
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        sessionStartTime.current = Date.now();
        checkAndUpdateStreak();
      }

      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        if (sessionStartTime.current) {
          const durationMs = Date.now() - sessionStartTime.current;
          const durationMinutes = Math.floor(durationMs / 60000);
          if (durationMinutes > 0) {
            recordAppUsageSession(durationMinutes).catch(console.error);
          }
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (sessionStartTime.current && appState.current === 'active') {
        const durationMs = Date.now() - sessionStartTime.current;
        const durationMinutes = Math.floor(durationMs / 60000);
        if (durationMinutes > 0) {
          recordAppUsageSession(durationMinutes).catch(console.error);
        }
      }
    };
  }, []);

  return (
    <KeyboardProvider>
      <LocationProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="location-search" options={{ presentation: 'modal', title: 'Search Location', headerShown: false }} />
            <Stack.Screen name="adkar/sabah" options={{ headerShown: false }} />
            <Stack.Screen name="adkar/masa" options={{ headerShown: false }} />
            <Stack.Screen name="adkar/[category]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </LocationProvider>
    </KeyboardProvider>
  );
}
