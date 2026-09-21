import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'content.articles', icon: 'book-outline' },
  { name: 'write', titleKey: 'content.write', icon: 'create-outline' },
  { name: 'bookmarks', titleKey: 'content.bookmarks', icon: 'bookmark-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'topbar';
