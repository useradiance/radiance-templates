import type { Ionicons } from '@expo/vector-icons';

export type TabDefinition = {
  name: string;
  titleKey: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

/**
 * Drawer items — same shape as tabs so starter overlays remain compatible.
 * Every entry must have a matching `app/(app)/(drawer)/<name>.tsx` route.
 */
export const tabs: TabDefinition[] = [
  { name: 'index', titleKey: 'navigation.home', icon: 'home-outline' },
  { name: 'settings', titleKey: 'navigation.settings', icon: 'settings-outline' },
];

/** @deprecated Prefer `tabs` — kept so older overlays that import drawerItems still typecheck. */
export const drawerItems = tabs;
