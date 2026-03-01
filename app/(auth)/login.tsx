import { Ionicons } from '@expo/vector-icons'; // Import Icon
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
export default function LoginScreen() {
  const router = useRouter();
  const { signIn, biometricSignIn } = useAuth(); // Ambil fungsi biometric dari context
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Isi semua bidang');
    
    setLoading(true);
    try {
      const deviceName = Device.deviceName || 'Android Device';
      await signIn(email, password, deviceName);
    } catch (error) {
      // Error sudah dihandle di context (Alert)
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 1. KeyboardAvoidingView agar input tidak tertutup */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* 2. TouchableWithoutFeedback agar klik di luar input bisa menutup keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-8"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-10">
              <Text className="text-4xl font-bold text-slate-900">Masuk</Text>
              <Text className="text-slate-500 mt-2">Gunakan akun Tiara Anda</Text>
            </View>

            <View className="space-y-4">
              {/* Input Email */}
              <View>
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Email</Text>
                <TextInput
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-900 focus:border-blue-500"
                  placeholder="Masukkan email"
                  autoCapitalize="none" // <-- MATIKAN CAPS LOCK DI SINI
                  keyboardType="email-address"
                />
              </View>

              {/* Input Password */}
              <View className="mt-4">
                <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
                <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 px-4">
                  <TextInput
                    className="flex-1 py-4 text-slate-900"
                    placeholder="Masukkan password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none" // <-- MATIKAN CAPS LOCK DI SINI JUGA
                    autoCorrect={false}   // Matikan auto-correct agar tidak muncul saran kata
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={22} 
                      color="#64748b" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tombol Login & Fingerprint ... */}
               <View className="flex-row items-center mt-10 space-x-3 gap-4">
          {/* Tombol Login Sekarang */}
          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className={`flex-1 p-4 rounded-2xl shadow-lg shadow-blue-300 items-center justify-center ${
              loading ? 'bg-blue-400' : 'bg-blue-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Login Sekarang</Text>
            )}
          </TouchableOpacity>

          {/* Tombol Icon Fingerprint */}
          <TouchableOpacity 
            onPress={biometricSignIn} // Panggil fungsi biometric dari context
            className="p-4 bg-slate-100 rounded-2xl border border-slate-200 items-center justify-center"
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