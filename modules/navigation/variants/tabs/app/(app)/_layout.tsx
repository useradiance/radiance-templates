import { Stack } from 'expo-router';

import { AuthGate } from '@/lib/registry/AuthGate';
import { useTheme } from '@/lib/theme';

/**
 * Signed-in shell (tabs). The tab bar lives in `(tabs)`; every other route in this group is
 * pushed on top of it as a normal stack screen. Those screens must set `Stack.Screen` titles
 * themselves — Expo Router otherwise uses the file path (`admin/index`).
 */
export default function AppLayout() {
  const theme = useTheme();

  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: {
            color: theme.colors.text,
            fontFamily: theme.fonts.body,
            fontWeight: theme.typography.weight.semibold,
          },
          headerTintColor: theme.colors.primary,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthGate>
  );
}
