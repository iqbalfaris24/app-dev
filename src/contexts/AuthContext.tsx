import * as LocalAuthentication from 'expo-local-authentication';
import { useRootNavigationState, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
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
  isBiometricEnabled: boolean;
  toggleBiometric: (val: boolean) => Promise<void>;
  signIn: (email: string, password: string, deviceName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  biometricSignIn: () => Promise<void>;
  unlock: () => Promise<void>;
};

const BIOMETRIC_SETTING_KEY = 'biometric_enabled';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  
  const router = useRouter();
  const segments = useSegments();
  const appState = useRef(AppState.currentState);
  const rootNavigationState = useRootNavigationState(); 

  // 1. CEK STATUS AWAL SAAT APLIKASI DIBUKA (COLD BOOT)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const savedSetting = await SecureStore.getItemAsync(BIOMETRIC_SETTING_KEY);
        const biometricActive = savedSetting === 'true';
        if (isMounted) setIsBiometricEnabled(biometricActive);

        const token = await TokenManager.get();
        if (token) {
          
          // --- LOGIKA 2 KONDISI SESUAI PERMINTAAN ANDA ---
          if (biometricActive) {
            // KONDISI 1: Biometrik ON -> Validasi Token & Langsung Kunci Layar
            try {
              const me = await api.get('/auth/me');
              if (isMounted) {
                setUser(me.data.data || me.data);
                setIsSignedIn(true);
                setIsLocked(true); // Minta sidik jari
              }
            } catch (e) {
              await TokenManager.remove();
              if (isMounted) {
                setUser(null);
                setIsSignedIn(false);
                setIsLocked(false);
              }
            }
          } else {
            // KONDISI 2: Biometrik OFF -> Hancurkan Sesi!
            // Karena aplikasi sempat ditutup, dan biometrik tidak aktif, paksa login ulang.
            await TokenManager.remove();
            if (isMounted) {
              setUser(null);
              setIsSignedIn(false);
              setIsLocked(false);
            }
          }
          // ----------------------------------------------

        } else {
          if (isMounted) {
            setIsSignedIn(false);
            setIsLocked(false);
          }
        }
      } catch (error) {
        console.error("Auth mount error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // 2. KUNCI APP SAAT KEMBALI DARI BACKGROUND (MINIMIZE)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isSignedIn) {
          if (isBiometricEnabled) {
            // Jika di-minimize dan biometrik ON -> Kunci Layar
            setIsLocked(true);
          }
          // Jika biometrik OFF, biarkan saja kembali ke layar semula (tidak usah logout)
          // karena user mungkin cuma buka WhatsApp sebentar untuk cek pesan
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isSignedIn, isBiometricEnabled]);

  // 3. LOGIKA REDIRECT HALAMAN
  useEffect(() => {
    if (loading || !rootNavigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAtRoot = segments[0] === undefined;

    if (isSignedIn) {
      if (inAuthGroup || isAtRoot) {
        setTimeout(() => { router.replace('/(tabs)'); }, 1);
      }
    } else {
      if (!inAuthGroup) {
        setTimeout(() => { router.replace('/(auth)/login'); }, 1);
      }
    }
  }, [isSignedIn, loading, segments, router, rootNavigationState?.key]);

  // --- FUNGSI AKSI ---

  const toggleBiometric = async (val: boolean) => {
    setIsBiometricEnabled(val);
    await SecureStore.setItemAsync(BIOMETRIC_SETTING_KEY, val.toString());
  };

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
        setIsLocked(false); 
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login gagal';
      Alert.alert('Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try { await api.post('/auth/logout'); } catch (e) {}
    
    // Saat logout, bersihkan semuanya termasuk pengaturan biometrik user ini
    await TokenManager.remove();
    await SecureStore.deleteItemAsync(BIOMETRIC_SETTING_KEY);
    await SecureStore.deleteItemAsync('biometric_prompt_dismissed');
    
    setUser(null);
    setIsBiometricEnabled(false);
    setIsSignedIn(false);
    setIsLocked(false);
    setLoading(false);
    router.replace('/(auth)/login');
  };

  const unlock = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setIsLocked(false); 
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifikasi Identitas Anda',
      fallbackLabel: 'Gunakan Sandi Perangkat',
    });

    if (result.success) {
      setIsLocked(false);
    }
  };
    
  const biometricSignIn = async () => {
    if (!isBiometricEnabled) {
      return Alert.alert('Akses Ditolak', 'Fitur biometrik dinonaktifkan.');
    }

    const isEnrolled = await LocalAuthentication.hasHardwareAsync();
    if (!isEnrolled) return Alert.alert('Info', 'Biometrik tidak tersedia pada perangkat ini');

    const savedToken = await TokenManager.get();
    if (!savedToken) return Alert.alert('Gagal', 'Tidak ada sesi tersimpan. Silakan login manual.');

    const result = await LocalAuthentication.authenticateAsync({ 
      promptMessage: 'Autentikasi untuk masuk' 
    });
    
    if (result.success) {
      try {
        setLoading(true);
        const me = await api.get('/auth/me');
        setUser(me.data.data || me.data);
        setIsSignedIn(true);
        setIsLocked(false);
        router.replace('/(tabs)');
      } catch (e) {
        Alert.alert('Error', 'Sesi berakhir, silakan login ulang.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isSignedIn, signIn, signOut, biometricSignIn, isLocked, unlock, isBiometricEnabled, toggleBiometric }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
}

export default AuthContext;