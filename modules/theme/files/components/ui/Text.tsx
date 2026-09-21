import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/lib/theme/context';

export type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'label' | 'caption';
export type TextTone =
  | 'default'
  | 'muted'
  | 'inverted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: keyof ReturnType<typeof useTheme>['typography']['weight'];
  center?: boolean;
};

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  center = false,
  style,
  ...rest
}: TextProps) {
  const theme = useTheme();

  const displayFamily = theme.fonts.display;
  const bodyFamily =
    weight === 'bold' || weight === 'semibold'
      ? theme.fonts.bodySemibold
      : weight === 'medium'
        ? theme.fonts.bodyMedium
        : theme.fonts.body;

  const variantStyles: Record<TextVariant, TextStyle> = {
    display: {
      fontFamily: displayFamily,
      fontSize: theme.typography.size.xxl,
      lineHeight: theme.typography.lineHeight.xxl,
      fontWeight: theme.typography.weight.bold,
      letterSpacing: theme.typography.letterSpacing.display,
    },
    title: {
      fontFamily: displayFamily,
      fontSize: theme.typography.size.xl,
      lineHeight: theme.typography.lineHeight.xl,
      fontWeight: theme.typography.weight.bold,
      letterSpacing: theme.typography.letterSpacing.title,
    },
    subtitle: {
      fontFamily: bodyFamily,
      fontSize: theme.typography.size.lg,
      lineHeight: theme.typography.lineHeight.lg,
      fontWeight: theme.typography.weight.semibold,
      letterSpacing: theme.typography.letterSpacing.subtitle,
    },
    body: {
      fontFamily: bodyFamily,
      fontSize: theme.typography.size.md,
      lineHeight: theme.typography.lineHeight.md,
      fontWeight: theme.typography.weight.regular,
      letterSpacing: theme.typography.letterSpacing.body,
    },
    label: {
      fontFamily: bodyFamily,
      fontSize: theme.typography.size.sm,
      lineHeight: theme.typography.lineHeight.sm,
      fontWeight: theme.typography.weight.medium,
      letterSpacing: theme.typography.letterSpacing.label,
    },
    caption: {
      fontFamily: bodyFamily,
      fontSize: theme.typography.size.xs,
      lineHeight: theme.typography.lineHeight.xs,
      fontWeight: theme.typography.weight.regular,
      letterSpacing: theme.typography.letterSpacing.caption,
    },
  };

  const toneColors: Record<TextTone, string> = {
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    inverted: theme.colors.textInverted,
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: toneColors[tone] },
        weight ? { fontWeight: theme.typography.weight[weight] } : null,
        center ? { textAlign: 'center' } : null,
        style,
      ]}
      {...rest}
    />
  );
}
