import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut, isBiometricEnabled, toggleBiometric } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header Custom */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Profil & Pengaturan</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* User Info Section */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center border-4 border-white shadow-sm">
            <Ionicons name="person" size={50} color="#3b82f6" />
          </View>
          <Text className="text-2xl font-bold text-slate-900 mt-4">{user?.name || 'User Tiara'}</Text>
          <Text className="text-slate-500">{user?.email || 'email@example.com'}</Text>
        </View>

        {/* Security Section */}
        <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3 ml-1">Keamanan</Text>
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-blue-50 p-2 rounded-xl mr-4">
                <Ionicons name="finger-print" size={22} color="#3b82f6" />
              </View>
              <View>
                <Text className="text-slate-800 font-semibold">Biometrik</Text>
                <Text className="text-slate-400 text-xs">Kunci app dengan sidik jari</Text>
              </View>
            </View>
            <Switch 
              value={isBiometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
              thumbColor={isBiometricEnabled ? "#3b82f6" : "#94a3b8"}
            />
          </View>
        </View>

        {/* Action Section */}
        <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-3 ml-1">Akun</Text>
        <TouchableOpacity 
          onPress={signOut}
          className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="bg-red-50 p-2 rounded-xl mr-4">
              <Ionicons name="log-out" size={22} color="#ef4444" />
            </View>
            <Text className="text-red-500 font-semibold">Keluar dari Aplikasi</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
        </TouchableOpacity>

        <Text className="text-center text-slate-300 text-xs mt-10 mb-10">Tiara Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}