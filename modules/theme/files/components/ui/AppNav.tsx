import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type AppNavItem = {
  name: string;
  href: string;
  title: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
};

function BrandMark({ name }: { name: string }) {
  const theme = useTheme();
  const initial = (name.trim()[0] ?? 'A').toUpperCase();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="label" weight="bold" style={{ color: theme.colors.primaryText }}>
          {initial}
        </Text>
      </View>
      <Text variant="subtitle" numberOfLines={1} style={{ flexShrink: 1 }}>
        {name}
      </Text>
    </View>
  );
}

export function SidebarNav({
  brand,
  items,
  footer,
}: {
  brand: string;
  items: AppNavItem[];
  footer?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 240,
        borderRightWidth: 1,
        borderRightColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingTop: theme.spacing.xl,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.lg,
        gap: theme.spacing.xs,
      }}
    >
      <View style={{ marginBottom: theme.spacing.md, paddingHorizontal: theme.spacing.sm }}>
        <BrandMark name={brand} />
      </View>
      {items.map((item) => (
        <Link key={item.name} href={item.href} asChild>
          <Pressable
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderRadius: theme.radius.md,
              backgroundColor: item.active ? theme.colors.secondary : 'transparent',
            }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.active ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text tone={item.active ? 'primary' : 'default'}>{item.title}</Text>
          </Pressable>
        </Link>
      ))}
      <View style={{ flex: 1 }} />
      {footer}
    </View>
  );
}

export function TopNav({
  brand,
  items,
  trailing,
}: {
  brand: string;
  items: AppNavItem[];
  trailing?: ReactNode;
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.lg,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      }}
    >
      <BrandMark name={brand} />
      <View
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}
      >
        {items.map((item) => (
          <Link key={item.name} href={item.href} asChild>
            <Pressable
              style={{
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.md,
                borderRadius: theme.radius.pill,
                backgroundColor: item.active ? theme.colors.secondary : 'transparent',
              }}
            >
              <Text
                tone={item.active ? 'primary' : 'muted'}
                weight={item.active ? 'semibold' : 'medium'}
              >
                {item.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </View>
      {trailing}
    </View>
  );
}
