import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardScreen() {
  const { user, isBiometricEnabled, toggleBiometric, isSignedIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Deteksi Tema (Light/Dark Mode)
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // --- DATA MENU DENGAN DUKUNGAN DARK MODE ---
const menuFeatures = [
    { 
      id: '1', 
      title: 'Server', 
      icon: 'server', 
      lightColor: '#3b82f6', // blue-500
      darkColor: '#60a5fa',  // blue-400 (Lebih terang/menyala)
      bgBox: 'bg-blue-50 dark:bg-blue-900/30', 
      borderBox: 'border-transparent dark:border-blue-500/30'
    },
    { 
      id: '2', 
      title: 'Knowledge\nBase', 
      icon: 'library', 
      lightColor: '#f97316', // orange-500
      darkColor: '#fb923c',  // orange-400
      bgBox: 'bg-orange-50 dark:bg-orange-900/30', 
      borderBox: 'border-transparent dark:border-orange-500/30'
    },
    { 
      id: '3', 
      title: 'Tools\nEngine', 
      icon: 'construct', 
      lightColor: '#10b981', // emerald-500
      darkColor: '#34d399',  // emerald-400
      bgBox: 'bg-emerald-50 dark:bg-emerald-900/30', 
      borderBox: 'border-transparent dark:border-emerald-500/30'
    },
    { 
      id: '4', 
      title: 'Tools\nMonitoring', 
      icon: 'pulse', 
      lightColor: '#8b5cf6', // violet-500
      darkColor: '#a78bfa',  // violet-400
      bgBox: 'bg-violet-50 dark:bg-violet-900/30', 
      borderBox: 'border-transparent dark:border-violet-500/30'
    },
  ];

  // LOGIKA POP-UP MENGGUNAKAN useFocusEffect
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const checkBiometricOffer = async () => {
        if (!isActive || !isSignedIn) return;

        const hasDismissed = await SecureStore.getItemAsync('biometric_prompt_dismissed');
        if (hasDismissed === 'true' || isBiometricEnabled) return;

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          Alert.alert(
            "Aktifkan Biometrik?",
            "Ingin menggunakan sidik jari untuk masuk ke aplikasi berikutnya?",
            [
              { text: "Nanti Saja", style: "cancel", onPress: async () => await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true') },
              { text: "Ya, Aktifkan", onPress: async () => { await toggleBiometric(true); await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true'); } }
            ]
          );
        }
      };

      const timeout = setTimeout(checkBiometricOffer, 1500);

      return () => {
        isActive = false;
        clearTimeout(timeout);
      };
    }, [isBiometricEnabled, isSignedIn])
  );

  return (
    <View 
      className="flex-1 bg-slate-50 dark:bg-slate-950" 
      style={{ paddingTop: insets.top }}
    >
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} // Memberi ruang agar tidak tertutup Tab Bar Bawah
      >
        
        {/* --- 1. HEADER SECTION --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Selamat datang kembali,</Text>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold mt-1 tracking-tight">
              {user?.name || 'User Tiara'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/profile')} 
            className="bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            <Ionicons name="person-circle" size={44} color={isDark ? "#64748b" : "#94a3b8"} />
          </TouchableOpacity>
        </View>

        {/* --- 2. AI CHAT BANNER --- */}
        <View className="px-6 mt-4">
          <TouchableOpacity 
            onPress={() => router.push('/chat')} // Arahkan banner langsung ke halaman chat
            className="bg-blue-600 rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-blue-500/30"
          >
            <View className="flex-1 pr-4">
              <View className="bg-blue-500/50 self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-blue-50 text-xs font-bold tracking-wider">NEW FEATURE</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1">Tanya Tiara AI</Text>
              <Text className="text-blue-100 text-sm leading-relaxed">
                Asisten pintar Anda siap membantu menganalisis log dan data server.
              </Text>
            </View>
            <View className="bg-white/20 p-4 rounded-full">
              <Ionicons name="sparkles" size={32} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

       {/* --- 3. GRID MENU FITUR UTAMA --- */}
        <View className="px-6 mt-8 mb-6">
          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Layanan Utama</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {menuFeatures.map((menu) => (
              <TouchableOpacity 
                key={menu.id}
                className="w-[48%] bg-white dark:bg-slate-900 p-4 rounded-3xl mb-4 shadow-sm border border-slate-100 dark:border-slate-800 items-center justify-center"
              >
                {/* Kotak Ikon dengan efek Border Glow di Dark Mode */}
                <View className={`${menu.bgBox} border ${menu.borderBox} w-14 h-14 rounded items-center justify-center mb-3`}>
                  <Ionicons 
                    name={menu.icon as any} 
                    size={28} 
                    // Warna ikon diset eksplisit berdasarkan tema sistem
                    color={isDark ? menu.darkColor : menu.lightColor} 
                  />
                </View>
                <Text className="text-slate-700 dark:text-slate-200 font-semibold text-center text-sm leading-tight">
                  {menu.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- 4. RECENT ACTIVITY --- */}
        <View className="px-6 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Status Sistem Terakhir</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
            {/* List 1 */}
            <View className="flex-row items-center mb-4">
              <View className="bg-orange-50 dark:bg-orange-500/10 p-2.5 rounded-full mr-3">
                <Ionicons name="warning-outline" size={20} color={isDark ? "#fb923c" : "#f97316"} />
              </View>
              <View className="flex-1 border-b border-slate-50 dark:border-slate-800/50 pb-3">
                <Text className="text-slate-800 dark:text-slate-200 font-medium text-sm">Peringatan CPU Usage Tinggi</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Server Node-02 • 10 menit lalu</Text>
              </View>
            </View>
            
            {/* List 2 */}
            <View className="flex-row items-center">
              <View className="bg-green-50 dark:bg-green-500/10 p-2.5 rounded-full mr-3">
                <Ionicons name="checkmark-circle-outline" size={20} color={isDark ? "#4ade80" : "#22c55e"} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 dark:text-slate-200 font-medium text-sm">Backup Database Sukses</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Tools Engine • 2 jam lalu</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}