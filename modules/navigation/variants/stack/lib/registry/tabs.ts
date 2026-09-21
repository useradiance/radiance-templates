import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  /** Route file name inside app/(app)/, without the extension. */
  name: string;
  /** Translation key for the tab label. */
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

/**
 * Tab bar contents. Every entry must have a matching `app/(app)/<name>.tsx` route.
 * Starters and feature modules extend this list.
 */
export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'navigation.home', icon: 'home-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];
