import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, CheckCircle2, Info, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'delete' | 'warning';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

export default function CustomAlert({
    visible,
    title,
    message,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = true
}: CustomAlertProps) {
    if (!visible) return null;

    let Icon = Info;
    let accentColor = '#10b981'; // Default Green

    switch (type) {
        case 'success':
            Icon = CheckCircle2;
            accentColor = '#10b981';
            break;
        case 'error':
            Icon = AlertCircle;
            accentColor = '#ef4444';
            break;
        case 'delete':
            Icon = Trash2;
            accentColor = '#ef4444';
            break;
        case 'warning':
            Icon = AlertCircle;
            accentColor = '#f59e0b';
            break;
        case 'info':
            Icon = Info;
            accentColor = '#3b82f6';
            break;
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View className="flex-1 bg-black/60 items-center justify-center px-6">
                <View
                    style={{ borderColor: `${accentColor}40` }}
                    className="w-full max-w-sm rounded-[32px] overflow-hidden border shadow-2xl"
                >
                    <LinearGradient colors={['#050f05', '#0a1a0f', '#050f05']} className="p-6">
                        <View className="items-center mb-4">
                            <View
                                style={{ backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }}
                                className="p-4 rounded-3xl border"
                            >
                                <Icon size={32} color={accentColor} />
                            </View>
                        </View>

                        <Text className="text-white text-2xl font-bold text-center mb-2 px-2">
                            {title}
                        </Text>

                        <Text className="text-gray-400 text-base text-center mb-8 px-4 leading-6">
                            {message}
                        </Text>

                        <View className="flex-row space-x-3 gap-3">
                            {showCancel && (
                                <TouchableOpacity
                                    onPress={onCancel}
                                    className="flex-1 bg-white/5 py-4 rounded-2xl border border-white/10 items-center justify-center"
                                >
                                    <Text className="text-gray-400 font-bold text-base">
                                        {cancelText}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={onConfirm}
                                style={{ backgroundColor: accentColor }}
                                className="flex-1 py-4 rounded-2xl items-center justify-center shadow-lg"
                                activeOpacity={0.8}
                            >
                                <Text className="text-[#050805] font-black tracking-wide text-base">
                                    {confirmText}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
}
