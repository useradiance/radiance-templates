import { Ionicons } from '@expo/vector-icons';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export type IconButtonSize = 'sm' | 'md' | 'lg';

type IconGlyph = keyof typeof Ionicons.glyphMap;

/**
 * Prefer `name` (Ionicons glyph). `icon` is accepted as an alias so Paper-style /
 * LLM-authored call sites typecheck without a repair round. Plain `string` is allowed
 * for the same reason — invalid glyph names fail at render, not in a repair loop.
 * Pass at least one of `name` or `icon`.
 */
export type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  name?: IconGlyph | string;
  icon?: IconGlyph | string;
  size?: IconButtonSize;
  color?: string;
  accessibilityLabel: string;
  style?: ViewStyle;
};

const HIT: Record<IconButtonSize, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

const ICON: Record<IconButtonSize, number> = {
  sm: 18,
  md: 22,
  lg: 26,
};

/** Compact icon control for quantity steppers, likes, and toolbar actions. */
export function IconButton({
  name,
  icon,
  size = 'md',
  color,
  accessibilityLabel,
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  const dim = HIT[size];
  const glyph = (name ?? icon) as IconGlyph;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        {
          width: dim,
          height: dim,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme.radius.pill,
          backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
      {...rest}
    >
      <Ionicons name={glyph} size={ICON[size]} color={color ?? theme.colors.text} />
    </Pressable>
  );
}
