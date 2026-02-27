import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

export function OfflineNotice() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View className="flex-row items-center p-4 rounded-2xl gap-3 my-2.5 border border-black/5" style={{ backgroundColor: theme.card }}>
            <WifiOff size={24} color={theme.primary} />
            <Text className="text-sm font-medium flex-1" style={{ color: theme.text }}>
                Please connect to the internet to load all features.
            </Text>
        </View>
    );
}
