import { Stack } from 'expo-router';

import { useTheme } from '@/lib/theme';

/** Public marketing chrome — no auth gate. */
export default function MarketingLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    />
  );
}
