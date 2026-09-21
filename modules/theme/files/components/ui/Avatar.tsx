import { Image, View, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = {
  uri?: string | null;
  name?: string | null;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
};

const SIZE: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 72,
};

/** Circular avatar with image or initials fallback. */
export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const theme = useTheme();
  const dim = SIZE[size];
  const initial = (name?.trim()?.[0] ?? '?').toUpperCase();

  const base = {
    width: dim,
    height: dim,
    borderRadius: theme.radius.pill,
  } as const;

  if (uri) {
    return (
      <Image
        accessibilityIgnoresInvertColors
        source={{ uri }}
        style={[
          {
            ...base,
            backgroundColor: theme.colors.skeleton,
          } satisfies ImageStyle,
          style as StyleProp<ImageStyle>,
        ]}
      />
    );
  }

  return (
    <View
      accessibilityRole="image"
      style={[
        {
          ...base,
          backgroundColor: theme.colors.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        variant={size === 'sm' ? 'caption' : size === 'xl' ? 'subtitle' : 'label'}
        tone="muted"
        weight="semibold"
      >
        {initial}
      </Text>
    </View>
  );
}
