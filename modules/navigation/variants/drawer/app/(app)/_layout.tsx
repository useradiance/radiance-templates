import { Stack } from 'expo-router';

import { AuthGate } from '@/lib/registry/AuthGate';
import { useTheme } from '@/lib/theme';

/**
 * Signed-in shell (drawer). The drawer lives in `(drawer)`; every other route in this group is
 * pushed on top of it as a normal stack screen (same pattern as the tabs shell).
 * Pushed screens must set `Stack.Screen` titles themselves.
 */
export default function AppLayout() {
  const theme = useTheme();

  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.text },
          headerTintColor: theme.colors.primary,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </AuthGate>
  );
}
