import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import api from '../services/api';
import { TokenManager } from '../utils/tokenManager';

type User = Record<string, any> | null;

type AuthContextValue = {
  user: User;
  loading: boolean;
  isSignedIn: boolean;
  isLocked: boolean;
  signIn: (email: string, password: string, deviceName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  biometricSignIn: () => Promise<void>;
  unlock: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);
  // Check auth state on mount (without redirecting yet)

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      // Jika aplikasi kembali ke 'active' dari background
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isSignedIn) {
          setIsLocked(true); // Kunci aplikasi
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isSignedIn]);

  useEffect(() => {
    (async () => {
      const token = await TokenManager.get();
      if (token) {
        // ... fetch user data seperti biasa
        setIsSignedIn(true);
        setIsLocked(true); // Aktifkan lock saat baru buka app (jika sudah login)
      }
      setLoading(false);
    })();
  }, []);

  // Route based on auth state after loading is done
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isSignedIn, loading, segments, router]);


  const signIn = async (email: string, password: string, deviceName?: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, device_name: deviceName });
      const data = res.data.data || res.data;
      const token = data.token || res.data.token;
      if (token) {
        await TokenManager.save(token);
        const me = await api.get('/auth/me');
        setUser(me.data.data || me.data);
        setIsSignedIn(true);
        router.replace('/(tabs)');
      } else {
        throw new Error('Token tidak ditemukan');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login gagal';
      Alert.alert('Login Gagal', msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore errors on logout
    }
    await TokenManager.remove();
    setUser(null);
    setIsSignedIn(false);
    setLoading(false);
    router.replace('/(auth)/login');
  };

  const unlock = async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Jika HP tidak support biometrik, mungkin minta PIN manual atau biarkan saja
        setIsLocked(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verifikasi Identitas Anda',
        fallbackLabel: 'Gunakan Password',
      });

      if (result.success) {
        setIsLocked(false);
      }
    };
    
  const biometricSignIn = async () => {
    const isEnrolled = await LocalAuthentication.hasHardwareAsync();
    if (!isEnrolled) return Alert.alert('Biometric tidak tersedia pada perangkat ini');

    const savedToken = await TokenManager.get();
    if (!savedToken) return Alert.alert('Tidak ada session tersimpan. Silakan login terlebih dahulu.');

    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Autentikasi untuk masuk' });
    if (result.success) {
      try {
        const me = await api.get('/auth/me');
        setUser(me.data.data || me.data);
        setIsSignedIn(true);
        router.replace('/(tabs)');
      } catch (e) {
        Alert.alert('Error', 'Gagal mengambil data pengguna');
      }
    } else {
      Alert.alert('Autentikasi dibatalkan');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSignedIn, signIn, signOut, biometricSignIn, isLocked, unlock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
