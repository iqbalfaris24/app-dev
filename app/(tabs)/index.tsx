import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store'; // <-- 1. Tambahkan import ini
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardScreen() {
  const { user, isBiometricEnabled, toggleBiometric, isSignedIn } = useAuth();
  const router = useRouter();
const insets = useSafeAreaInsets();
  // Data dummy untuk menu fitur
  const menuFeatures = [
    { 
      id: '1', 
      title: 'Servers', 
      icon: 'server', // Ikon server database
      color: 'text-blue-500', 
      bg: 'bg-blue-50',
      route: '/servers'
    },
    { 
      id: '2', 
      title: 'Netbox', 
      icon: 'git-network', // ikon perangkat jaringan
      color: 'text-purple-500', 
      bg: 'bg-purple-50',
      route: '/netbox'
    },
    { 
      id: '3', 
      title: 'Tools\nMonitoring', 
      icon: 'pulse', // Ikon detak jantung/grafik pantauan
      color: 'text-green-500', 
      bg: 'bg-green-50',
      route: '/tools'
    },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Indikator apakah layar ini masih terbuka

      const checkBiometricOffer = async () => {
        // PENGAMAN: Jika user belum login atau layar sudah ditinggalkan, BATALKAN POP-UP!
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
              { 
                text: "Nanti Saja", 
                style: "cancel",
                onPress: async () => {
                  await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true');
                }
              },
              { 
                text: "Ya, Aktifkan", 
                onPress: async () => {
                  await toggleBiometric(true);
                  await SecureStore.setItemAsync('biometric_prompt_dismissed', 'true');
                }
              }
            ]
          );
        }
      };

      const timeout = setTimeout(checkBiometricOffer, 1500);

      // Fungsi pembersih ini dipanggil otomatis saat user pindah halaman / layar tertutup
      return () => {
        isActive = false; 
        clearTimeout(timeout); 
      };
    }, [isBiometricEnabled, isSignedIn])
  );


  return (
    <View 
      className="flex-1 bg-slate-50"
      style={{ 
        paddingTop: insets.top,       
        paddingBottom: insets.bottom, 
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
  onPress={() => router.push('/profile')} 
  className="bg-slate-200 p-1 rounded-full border-2 border-white shadow-sm"
>
  <Ionicons name="person-circle" size={48} color="#94a3b8" />
</TouchableOpacity>
        </View>

        {/* --- 2. AI CHAT BANNER (HERO SECTION) --- */}
        <View className="px-6 mt-4">
          <TouchableOpacity 
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
                onPress={() => router.push(menu.route as any)}
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
      </ScrollView>
    </View>
  );
}