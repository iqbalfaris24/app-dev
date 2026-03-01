import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store'; // <-- 1. Tambahkan import ini
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
const insets = useSafeAreaInsets();
const { isBiometricEnabled, toggleBiometric } = useAuth();
  // Data dummy untuk menu fitur
  const menuFeatures = [
    { id: '1', title: 'Dokumen', icon: 'document-text', color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: '2', title: 'Jadwal', icon: 'calendar', color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: '3', title: 'Laporan', icon: 'bar-chart', color: 'text-green-500', bg: 'bg-green-50' },
    { id: '4', title: 'Manajemen', icon: 'people', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];
useEffect(() => {
    const checkBiometricOffer = async () => {
      // 2. Cek apakah user sudah pernah menekan "Nanti Saja" sebelumnya
      const hasDismissed = await SecureStore.getItemAsync('biometric_prompt_dismissed');
      
      // Jika sudah pernah menolak ATAU biometrik sudah aktif, jangan munculkan lagi
      if (hasDismissed === 'true' || isBiometricEnabled) return;

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        Alert.alert(
          "Aktifkan Biometrik?",
          "Ingin menggunakan sidik jari untuk masuk ke aplikasi berikutnya?",
          [
            { 
              text: "Nanti Saja", 
              style: "cancel",
              onPress: async () => {
                // 3. Simpan status penolakan ini agar tidak ditanya terus-menerus
                await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true');
              }
            },
            { 
              text: "Ya, Aktifkan", 
              onPress: async () => {
                await toggleBiometric(true);
                // Kita juga bisa set dismissed ke true di sini sebagai pengaman ganda
                await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true');
              }
            }
          ]
        );
      }
    };

    const timeout = setTimeout(checkBiometricOffer, 1500);
    return () => clearTimeout(timeout);
  }, [isBiometricEnabled]);


  return (
    <View 
      className="flex-1 bg-slate-50"
      style={{ 
        paddingTop: insets.top,       // Agar tidak menabrak Notif Bar (Jam/Baterai)
        paddingBottom: insets.bottom, // Agar tidak menabrak Home Indicator (Menu Bawah)
      }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* --- 1. HEADER SECTION --- */}
        <View className="flex-row justify-between items-center px-6 pt-6 pb-4">
          <View>
            <Text className="text-slate-500 text-sm font-medium">Selamat datang kembali,</Text>
            <Text className="text-slate-900 text-2xl font-bold mt-1">
              {user?.name || 'User Tiara'}
            </Text>
          </View>
        <TouchableOpacity 
  onPress={() => router.push('/profile')} // <--- Tambahkan Navigasi ke Halaman Profile
  className="bg-slate-200 p-1 rounded-full border-2 border-white shadow-sm"
>
  <Ionicons name="person-circle" size={48} color="#94a3b8" />
</TouchableOpacity>
        </View>

        {/* --- 2. AI CHAT BANNER (HERO SECTION) --- */}
        <View className="px-6 mt-4">
          <TouchableOpacity 
            // Nanti arahkan ke route chat AI, misalnya: router.push('/chat')
            onPress={() => console.log('Buka Chat AI')}
            className="bg-blue-600 rounded-3xl p-6 flex-row items-center justify-between shadow-lg shadow-blue-300"
          >
            <View className="flex-1 pr-4">
              <View className="bg-blue-500/50 self-start px-3 py-1 rounded-full mb-3">
                <Text className="text-blue-50 text-xs font-bold tracking-wider">NEW FEATURE</Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1">Tanya Tiara AI</Text>
              <Text className="text-blue-100 text-sm leading-relaxed">
                Asisten pintar Anda siap membantu menganalisis data dan laporan.
              </Text>
            </View>
            <View className="bg-white/20 p-4 rounded-full">
              <Ionicons name="sparkles" size={32} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 3. GRID MENU FITUR UTAMA --- */}
        <View className="px-6 mt-8 mb-6">
          <Text className="text-lg font-bold text-slate-800 mb-4">Fitur Utama</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {menuFeatures.map((menu) => (
              <TouchableOpacity 
                key={menu.id}
                className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-slate-100 items-center justify-center"
              >
                <View className={`${menu.bg} w-14 h-14 rounded-2xl items-center justify-center mb-3`}>
                  <Ionicons name={menu.icon as any} size={28} className={menu.color} />
                </View>
                <Text className="text-slate-700 font-semibold text-center">{menu.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- 4. RECENT ACTIVITY (Opsional untuk mengisi kekosongan layar) --- */}
        <View className="px-6 pb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-slate-800">Aktivitas Terakhir</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-medium">Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="bg-slate-100 p-2 rounded-full mr-3">
                <Ionicons name="document-text-outline" size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-slate-800 font-medium">Laporan Q3 2026.pdf</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Dilihat 2 jam yang lalu</Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <View className="bg-slate-100 p-2 rounded-full mr-3">
                <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
              </View>
              <View>
                <Text className="text-slate-800 font-medium">Verifikasi Dokumen Klien</Text>
                <Text className="text-slate-400 text-xs mt-0.5">Selesai kemarin</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}