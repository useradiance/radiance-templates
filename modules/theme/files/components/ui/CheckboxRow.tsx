import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type CheckboxRowProps = {
  title: string;
  subtitle?: string;
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Strike through title when checked (task lists). */
  strikethroughWhenChecked?: boolean;
};

/** Selectable row with checkbox affordance — tasks, filters, multi-select. */
export function CheckboxRow({
  title,
  subtitle,
  checked,
  onValueChange,
  disabled,
  strikethroughWhenChecked = false,
}: CheckboxRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => onValueChange(!checked)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.elevation.low,
        opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
      })}
    >
      <Ionicons
        name={checked ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={checked ? theme.colors.success : theme.colors.textMuted}
      />
      <View style={{ flex: 1, gap: theme.spacing.xs }}>
        <Text
          variant="body"
          tone={checked && strikethroughWhenChecked ? 'muted' : 'default'}
          style={
            checked && strikethroughWhenChecked ? { textDecorationLine: 'line-through' } : undefined
          }
        >
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
