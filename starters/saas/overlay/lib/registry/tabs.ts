import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'saas.workspace', icon: 'business-outline' },
  { name: 'people', titleKey: 'saas.people', icon: 'people-outline' },
  { name: 'billing', titleKey: 'saas.billing', icon: 'card-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'sidebar';
