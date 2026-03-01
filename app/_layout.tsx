import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LockScreen from '../src/components/LockScreen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';

export const unstable_settings = {
  anchor: '(auth)',
};

function RootLayoutContent() {
  const { loading, isSignedIn, isLocked } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Stack HARUS SELALU DI-RENDER agar mesin Expo Router tidak rusak */}
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'card' }} />
      </Stack>

      {/* 2. Loading State sebagai penutup layar sementara */}
      {loading && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      )}

      {/* 3. Lock Screen sebagai penutup layar jika aplikasi terkunci */}
      {!loading && isSignedIn && isLocked && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0f172a', zIndex: 100 }}>
          <LockScreen />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootLayoutContent />
          <StatusBar style="auto" />
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}