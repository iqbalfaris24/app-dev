import { Stack } from 'expo-router';
import "../../global.css"; // Sesuaikan path-nya
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
