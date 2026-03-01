import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LockScreen from '../src/components/LockScreen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
export const unstable_settings = {
  anchor: '(auth)',
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
const { loading, isSignedIn, isLocked } = useAuth();

  if (loading) return <ActivityIndicator />;

  if (isSignedIn && isLocked) {
      return <LockScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false, presentation: 'card' }} />
    </Stack>
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
