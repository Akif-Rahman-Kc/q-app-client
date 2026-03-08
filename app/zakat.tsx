import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
    AlertCircle,
    Calculator,
    ChevronLeft,
    HandCoins,
    Landmark,
    Receipt
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

function InputCard({
    label,
    value,
    setValue,
    icon,
    description
}: {
    label: string;
    value: string;
    setValue: (val: string) => void;
    icon: React.ReactNode;
    description: string;
}) {
    return (
        <View className="bg-[#0a140a] rounded-[20px] p-4 border border-[#142114] mb-4">
            <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-xl items-center justify-center mr-3 bg-[#10b98120]">
                    {icon}
                </View>
                <View className="flex-1">
                    <Text className="text-white text-base font-semibold mb-0.5">{label}</Text>
                    <Text className="text-[#6b7280] text-xs">{description}</Text>
                </View>
            </View>
            <View className="flex-row items-center bg-[#142114] border border-[#2d3a2d] rounded-2xl px-4">
                <Text className="text-[#9ca3af] text-xl font-semibold mr-2">₹</Text>
                <TextInput
                    className="flex-1 text-white text-xl font-semibold py-3.5"
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#4b5563"
                    value={value}
                    onChangeText={setValue}
                />
            </View>
        </View>
    );
}

export default function ZakatScreen() {
    const router = useRouter();

    const [cash, setCash] = useState('');
    const [goldSilver, setGoldSilver] = useState('');
    const [investments, setInvestments] = useState('');
    const [businessAssets, setBusinessAssets] = useState('');
    const [debts, setDebts] = useState('');
    const [nisab, setNisab] = useState('5000');

    const totalAssets = useMemo(() => (
        (parseFloat(cash) || 0) +
        (parseFloat(goldSilver) || 0) +
        (parseFloat(investments) || 0) +
        (parseFloat(businessAssets) || 0)
    ), [cash, goldSilver, investments, businessAssets]);

    const totalDebts = useMemo(() => parseFloat(debts) || 0, [debts]);
    const netWealth = Math.max(0, totalAssets - totalDebts);
    const nisabValue = parseFloat(nisab) || 0;
    const isEligible = netWealth >= nisabValue;
    const zakatPayable = isEligible ? netWealth * 0.025 : 0;

    return (
        <LinearGradient
            colors={['#050f05', '#0a1a0f', '#050f05']}
            style={{ flex: 1 }}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior="padding"
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#142114] mt-10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <ChevronLeft size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-xl">Zakat Calculator</Text>
                    <View style={{ width: 40 }} />
                </View>

                <KeyboardAwareScrollView
                    style={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                    extraKeyboardSpace={-310}
                    bottomOffset={0}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 16,
                        paddingBottom: 30
                    }}
                >
                    {/* Information Banner */}
                    <View className="flex-row bg-[#1a241a] p-4 rounded-2xl border border-[#2d3a2d] mb-6 items-center">
                        <View className="mr-4 bg-[#10b98120] p-2.5 rounded-xl">
                            <Landmark size={24} color="#10b981" />
                        </View>
                        <Text className="text-[#9ca3af] text-[13px] leading-5 flex-1 font-medium">
                            Zakat is 2.5% of your wealth that has been in your possession for one full lunar year (Hawl), provided it exceeds the Nisab threshold.
                        </Text>
                    </View>

                    {/* Result Card */}
                    <LinearGradient
                        colors={isEligible ? ['#10b98115', '#10b98105'] : ['#1a241a', '#0a0f0a']}
                        className={`p-6 rounded-3xl border mb-8 shadow-black shadow-md overflow-hidden ${isEligible ? 'border-[#10b98150]' : 'border-[#2d3a2d]'}`}
                        style={{ elevation: 5 }}
                    >
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-[#d1d5db] text-[15px] font-semibold uppercase tracking-widest">Total Zakat Payable</Text>
                            {isEligible ? (
                                <View className="bg-[#10b98120] px-2.5 py-1 rounded-xl border border-[#10b981]">
                                    <Text className="text-[#10b981] text-[11px] font-bold uppercase">Eligible</Text>
                                </View>
                            ) : (
                                <View className="bg-[#1a241a] px-2.5 py-1 rounded-xl border border-[#4b5563]">
                                    <Text className="text-[#9ca3af] text-[11px] font-bold uppercase">Below Nisab</Text>
                                </View>
                            )}
                        </View>

                        <Text
                            className={`text-[40px] font-extrabold mb-5 ${isEligible ? 'text-[#10b981]' : 'text-[#6b7280]'}`}
                            style={{ fontVariant: ['tabular-nums'] }}
                        >
                            ₹{zakatPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>

                        <View className="h-[1px] bg-[#2d3a2d] mb-4" />

                        <View className="flex-row justify-between">
                            <View className="flex-1">
                                <Text className="text-[#6b7280] text-xs font-medium mb-1">Net Wealth</Text>
                                <Text className="text-white text-base font-bold" style={{ fontVariant: ['tabular-nums'] }}>
                                    ₹{netWealth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                            <View className="flex-1 items-end">
                                <Text className="text-[#6b7280] text-xs font-medium mb-1">Nisab Threshold</Text>
                                <Text className="text-white text-base font-bold" style={{ fontVariant: ['tabular-nums'] }}>
                                    ₹{nisabValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Nisab Configuration */}
                    <View className="mb-4">
                        <Text className="text-white text-xl font-bold mb-1">Current Nisab</Text>
                        <Text className="text-[#6b7280] text-[13px]">Update based on current Gold/Silver prices</Text>
                    </View>
                    <View className="flex-row items-center bg-[#142114] border border-[#2d3a2d] rounded-2xl px-4 mb-6">
                        <Text className="text-[#9ca3af] text-xl font-semibold mr-2">₹</Text>
                        <TextInput
                            className="flex-1 text-white text-xl font-semibold py-3.5"
                            keyboardType="decimal-pad"
                            value={nisab}
                            onChangeText={setNisab}
                        />
                    </View>

                    <View className="h-[1px] bg-[#142114] mb-6" />

                    {/* Assets Section */}
                    <View className="mb-4">
                        <Text className="text-white text-xl font-bold mb-1">Your Wealth (Assets)</Text>
                        <Text className="text-[#6b7280] text-[13px]">Enter the value of assets held for over a year</Text>
                    </View>

                    <InputCard
                        label="Cash on Hand & Bank"
                        description="Money in bank accounts or physical cash"
                        value={cash}
                        setValue={setCash}
                        icon={<Landmark size={20} color="#10b981" />}
                    />
                    <InputCard
                        label="Gold & Silver"
                        description="Value of jewelry or bullion (not for daily use)"
                        value={goldSilver}
                        setValue={setGoldSilver}
                        icon={<HandCoins size={20} color="#10b981" />}
                    />
                    <InputCard
                        label="Investments & Shares"
                        description="Current market value of shares and crypto"
                        value={investments}
                        setValue={setInvestments}
                        icon={<Calculator size={20} color="#10b981" />}
                    />
                    <InputCard
                        label="Business Inventory"
                        description="Value of goods meant for sale"
                        value={businessAssets}
                        setValue={setBusinessAssets}
                        icon={<Receipt size={20} color="#10b981" />}
                    />

                    <View className="h-[1px] bg-[#142114] my-6" />

                    {/* Liabilities Section */}
                    <View className="mb-4">
                        <Text className="text-white text-xl font-bold mb-1">Your Deductions (Liabilities)</Text>
                        <Text className="text-[#6b7280] text-[13px]">Immediate short-term debts you owe</Text>
                    </View>

                    <InputCard
                        label="Owed Debts"
                        description="Money borrowed, pending bills, immediate loans"
                        value={debts}
                        setValue={setDebts}
                        icon={<AlertCircle size={20} color="#ef4444" />}
                    />

                </KeyboardAwareScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}