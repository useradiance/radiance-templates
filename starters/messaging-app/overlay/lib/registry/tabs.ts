import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'chat.inbox', icon: 'chatbubbles-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

/** Alias for drawer shell layouts / older imports. */
export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'sidebar';
