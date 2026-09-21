import { Stack } from 'expo-router';

import { GuestGate } from '@/lib/registry/GuestGate';
import { useTheme } from '@/lib/theme';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <GuestGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
    </GuestGate>
  );
}
