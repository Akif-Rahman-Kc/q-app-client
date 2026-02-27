import { Platform } from 'react-native';

const tintColorLight = '#059669'; // Emerald Green
const tintColorDark = '#34D399'; // Lighter Emerald

export const Colors = {
  light: {
    text: '#111827',
    background: '#F9FAFB',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    primary: '#059669',
    secondary: '#D97706',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9CA3AF',
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    primary: '#10B981',
    secondary: '#F59E0B',
    card: '#1F2937',
    border: '#374151',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System',
    mono: 'Courier',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
