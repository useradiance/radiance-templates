import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leading?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leading,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const height = { sm: 36, md: 48, lg: 56 }[size];
  const paddingHorizontal = { sm: theme.spacing.md, md: theme.spacing.lg, lg: theme.spacing.xl }[
    size
  ];
  const radius = { sm: theme.radius.md, md: theme.radius.lg, lg: theme.radius.lg }[size];

  const background: Record<ButtonVariant, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    ghost: 'transparent',
    danger: theme.colors.danger,
  };

  const foreground: Record<ButtonVariant, string> = {
    primary: theme.colors.primaryText,
    secondary: theme.colors.secondaryText,
    ghost: theme.colors.primary,
    danger: theme.colors.dangerText,
  };

  const elevate = variant === 'primary' || variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height,
          minWidth: height,
          paddingHorizontal,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          borderRadius: radius,
          backgroundColor: background[variant],
          borderWidth: variant === 'ghost' || variant === 'secondary' ? 1 : 0,
          borderColor: variant === 'secondary' ? theme.colors.borderStrong : theme.colors.border,
          opacity: isDisabled ? 0.45 : pressed ? 0.88 : 1,
          ...(pressed && !isDisabled ? { transform: [{ scale: 0.98 }] } : null),
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          ...(elevate && !isDisabled ? theme.elevation.low : theme.elevation.none),
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={foreground[variant]} size="small" />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text
            variant={size === 'sm' ? 'label' : 'body'}
            weight="semibold"
            style={{ color: foreground[variant] }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
