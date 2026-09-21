import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthGate } from '@/lib/registry/AuthGate';
import { useTheme } from '@/lib/theme';

/**
 * Signed-in shell as a simple stack (no tabs or drawer).
 */
export default function AppLayout() {
  const { t } = useTranslation();
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
        <Stack.Screen name="index" options={{ title: t('navigation.home') }} />
        <Stack.Screen name="settings" options={{ title: t('navigation.settings') }} />
      </Stack>
    </AuthGate>
  );
}
