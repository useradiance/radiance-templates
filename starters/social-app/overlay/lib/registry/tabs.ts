import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'feed.title', icon: 'newspaper-outline' },
  { name: 'new-post', titleKey: 'feed.compose', icon: 'add-circle-outline' },
  { name: 'people', titleKey: 'people.title', icon: 'people-outline' },
  { name: 'profile', titleKey: 'profile.title', icon: 'person-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

/** Alias for drawer shell layouts / older imports. */
export const drawerItems = tabs;

export type AppChrome = 'sidebar' | 'topbar';
export const appChrome: AppChrome = 'sidebar';
