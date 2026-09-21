import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'events.title', icon: 'ticket-outline' },
  { name: 'mine', titleKey: 'events.mine', icon: 'calendar-outline' },
  { name: 'host', titleKey: 'events.host', icon: 'megaphone-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'topbar';
