import { Ionicons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform, ScrollView,
  Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Kita ambil fungsi signIn dan biometricSignIn dari context
  const { signIn, biometricSignIn } = useAuth(); 

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Perhatian', 'Mohon isi email dan password Anda.');
    
    setLoading(true);
    try {
      const deviceName = Device.deviceName || 'Android Device';
      await signIn(email, password, deviceName);
    } catch (error) {
      // Error sudah ditangani otomatis di dalam AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-8 pb-10"
            showsVerticalScrollIndicator={false}
          >
            
            {/* --- BAGIAN LOGO & JUDUL --- */}
            <View className="items-center mb-10 mt-8">
              <View className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100 mb-6">
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  className="w-24 h-24 rounded-2xl"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Selamat Datang
              </Text>
              <Text className="text-slate-500 mt-2 text-center text-base">
                Silakan masuk untuk melanjutkan ke T.I.A.R.A
              </Text>
            </View>

            {/* --- BAGIAN FORM --- */}
            <View className="space-y-5">
              {/* Input Email */}
              <View>
                <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm">Alamat Email</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 focus:border-blue-500 shadow-sm shadow-slate-100">
                  <Ionicons name="mail-outline" size={20} color="#94a3b8" className="mr-3" />
                  <TextInput
                    className="flex-1 py-4 text-slate-900 font-medium"
                    placeholder="nama@email.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Input Password */}
              <View className="mt-4">
                <Text className="text-slate-700 font-bold mb-2 ml-1 text-sm">Kata Sandi</Text>
                <View className="flex-row items-center bg-white rounded-2xl border border-slate-200 px-4 focus:border-blue-500 shadow-sm shadow-slate-100">
                  <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" className="mr-3" />
                  <TextInput
                    className="flex-1 py-4 text-slate-900 font-medium"
                    placeholder="Masukkan sandi Anda"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2 -mr-2">
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={22} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Barisan Tombol Login & Fingerprint (Jarak diatur ulang karena Lupa Sandi dihapus) */}
              <View className="flex-row items-center mt-8 space-x-4 gap-4">
                <TouchableOpacity 
                  onPress={handleLogin}
                  disabled={loading}
                  className={`flex-1 p-4 rounded-2xl shadow-lg shadow-blue-300/50 items-center justify-center ${
                    loading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-lg tracking-wide">Masuk</Text>
                  )}
                </TouchableOpacity>

                {/* Tombol Biometrik Selalu Tampil */}
                <TouchableOpacity 
                  onPress={biometricSignIn}
                  className="p-4 bg-white rounded-2xl border border-slate-200 items-center justify-center shadow-sm"
                >
                  <Ionicons name="finger-print" size={28} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            </View>
            
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}