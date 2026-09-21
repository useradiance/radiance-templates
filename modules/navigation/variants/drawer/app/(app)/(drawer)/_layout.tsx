import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { useTranslation } from 'react-i18next';

import { useResponsive } from '@/hooks/useResponsive';
import { tabs } from '@/lib/registry/tabs';
import { isWeb } from '@/lib/platform';
import { useTheme } from '@/lib/theme';

export default function DrawerLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const permanent = isWeb && isDesktop;

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.primary,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textMuted,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: permanent ? 280 : 280,
        },
        drawerType: permanent ? 'permanent' : 'front',
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {tabs.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{
            title: t(item.titleKey),
            drawerIcon: ({ color, size }) => (
              <Ionicons name={item.icon} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Drawer>
  );
}
