import * as Device from 'expo-device';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, biometricSignIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Harap isi semua bidang');
    }

    setLoading(true);
    try {
      await signIn(email, password, Device.deviceName || 'Android Device');
      Alert.alert('Sukses', 'Berhasil masuk');
      // After successful login, offer to enable biometric login
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        Alert.alert('Aktifkan Fingerprint?', 'Ingin mengaktifkan login dengan sidik jari untuk perangkat ini?', [
          { text: 'Nanti' },
          { text: 'Ya', onPress: async () => { Alert.alert('Siap', 'Fingerprint telah diaktifkan pada perangkat (memakai session yang tersimpan)'); } },
        ]);
      }
    } catch (e) {
      // signIn already alerts on failure
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    if (!isAvailable) return Alert.alert('Biometric tidak tersedia');
    biometricSignIn();
  };

  return (
    <View className="flex-1 bg-white justify-center px-8">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-slate-900">Masuk</Text>
        <Text className="text-slate-500 mt-2">Gunakan akun Tiara Anda</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Email</Text>
          <TextInput
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900 focus:border-blue-500"
            placeholder="Masukkan email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mt-4">
          <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
          <TextInput
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900 focus:border-blue-500"
            placeholder="Masukkan password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`mt-10 p-4 rounded-2xl shadow-lg shadow-blue-300 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">Login Sekarang</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBiometric} className="mt-4 p-3 rounded-2xl border border-slate-200">
          <Text className="text-center text-slate-700">Login dengan Fingerprint</Text>
        </TouchableOpacity>
      </View>
      <View className="w-full py-4 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <Text className="text-center text-slate-500">Butuh bantuan? Hubungi support.</Text>
      </View>
    </View>
  );
}