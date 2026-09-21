import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/IconButton';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type TextFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string | null;
};

export function TextField({
  label,
  helper,
  error,
  style,
  onFocus,
  onBlur,
  secureTextEntry,
  ...rest
}: TextFieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const isPassword = Boolean(secureTextEntry);
  const hideValue = isPassword && hidden;

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.primary
      : theme.colors.border;

  return (
    <View style={{ gap: theme.spacing.xs, alignSelf: 'stretch' }}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}

      <View>
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={hideValue}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              minHeight: theme.responsiveSpace.touch.xs,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.md,
              paddingRight: isPassword ? theme.spacing.xxl + theme.spacing.md : theme.spacing.lg,
              borderWidth: focused || error ? 1.5 : 1,
              borderColor,
              borderRadius: theme.radius.lg,
              backgroundColor: focused ? theme.colors.surfaceElevated : theme.colors.surface,
              color: theme.colors.text,
              fontSize: theme.typography.size.md,
              lineHeight: theme.typography.lineHeight.md,
            },
            style,
          ]}
          {...rest}
        />
        {isPassword ? (
          <View
            style={{
              position: 'absolute',
              right: theme.spacing.xs,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
            }}
          >
            <IconButton
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size="sm"
              color={theme.colors.textMuted}
              accessibilityLabel={hidden ? t('common.showPassword') : t('common.hidePassword')}
              onPress={() => setHidden((value) => !value)}
            />
          </View>
        ) : null}
      </View>

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
