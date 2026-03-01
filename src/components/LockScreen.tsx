import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LockScreen() {
  const { unlock } = useAuth();

  useEffect(() => {
    unlock(); // Langsung panggil biometric saat layar ini muncul
  }, []);

  return (
    <View className="flex-1 bg-slate-900 justify-center items-center px-6">
      <Ionicons name="lock-closed" size={80} color="#3b82f6" />
      <Text className="text-white text-2xl font-bold mt-6 text-center">
        Aplikasi Terkunci
      </Text>
      <Text className="text-slate-400 text-center mt-2 mb-10">
        Silakan gunakan sidik jari untuk melanjutkan
      </Text>
      
      <TouchableOpacity 
        onPress={unlock}
        className="bg-blue-600 px-8 py-4 rounded-2xl"
      >
        <Text className="text-white font-bold text-lg">Buka Kunci</Text>
      </TouchableOpacity>
    </View>
  );
}