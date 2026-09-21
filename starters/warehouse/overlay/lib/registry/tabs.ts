import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'warehouse.stock', icon: 'cube-outline' },
  { name: 'items', titleKey: 'warehouse.items', icon: 'pricetag-outline' },
  { name: 'locations', titleKey: 'warehouse.locations', icon: 'business-outline' },
  { name: 'categories', titleKey: 'warehouse.categories', icon: 'albums-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'sidebar';
