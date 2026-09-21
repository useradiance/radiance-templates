import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SidebarNav, TopNav, type AppNavItem } from '@/components/ui/AppNav';
import { useResponsive } from '@/hooks/useResponsive';
import { isWeb } from '@/lib/platform';
import { appChrome, tabs } from '@/lib/registry/tabs';
import { useTheme } from '@/lib/theme';

function toItems(pathname: string, translate: (key: string) => string): AppNavItem[] {
  return tabs.map((tab) => {
    const href = tab.name === 'index' ? '/' : `/${tab.name}`;
    const active =
      pathname === href ||
      (tab.name === 'index' && (pathname === '/' || pathname.endsWith('/index')));
    return {
      name: tab.name,
      href,
      title: translate(tab.titleKey),
      icon: tab.icon,
      active,
    };
  });
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const pathname = usePathname();
  const chrome = appChrome ?? 'sidebar';
  const desktop = isWeb && isDesktop;
  const useSidebar = desktop && chrome === 'sidebar';
  const useTopbar = desktop && chrome === 'topbar';
  const items = toItems(pathname, t);
  const brand = t('common.appName');

  return (
    <View style={{ flex: 1, flexDirection: useSidebar ? 'row' : 'column' }}>
      {useSidebar ? <SidebarNav brand={brand} items={items} /> : null}
      {useTopbar ? <TopNav brand={brand} items={items} /> : null}

      <View style={{ flex: 1, minWidth: 0 }}>
        <Tabs
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: {
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontWeight: theme.typography.weight.semibold,
            },
            headerShown: !useTopbar,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textMuted,
            tabBarStyle:
              useSidebar || useTopbar
                ? { display: 'none' }
                : {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                  },
          }}
        >
          {tabs.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: t(tab.titleKey),
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name={tab.icon} color={color} size={size} />
                ),
              }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}
