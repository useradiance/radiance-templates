import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'shop.title', icon: 'storefront-outline' },
  { name: 'cart', titleKey: 'cart.title', icon: 'cart-outline' },
  { name: 'orders', titleKey: 'orders.title', icon: 'receipt-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

/** Alias for drawer shell layouts / older imports. */
export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'topbar';
