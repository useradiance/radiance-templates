import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Sheet, type SheetAnchor } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  label?: string;
  value: string | null;
  options: SelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
};

/** Dropdown: bottom sheet on phone, popup menu on desktop. */
export function Select({ label, value, options, placeholder, onChange }: SelectProps) {
  const theme = useTheme();
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<SheetAnchor | null>(null);
  const selected = options.find((option) => option.value === value);

  function openMenu() {
    const node = triggerRef.current;
    if (!node) {
      setAnchor(null);
      setOpen(true);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      setAnchor(width || height ? { x, y, width, height } : null);
      setOpen(true);
    });
  }

  return (
    <View style={{ gap: theme.spacing.xs, alignSelf: 'stretch' }}>
      {label ? (
        <Text variant="label" tone="muted">
          {label}
        </Text>
      ) : null}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          onPress={openMenu}
          style={({ pressed }) => ({
            minHeight: theme.responsiveSpace.touch.xs,
            paddingHorizontal: theme.spacing.lg,
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface,
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Text variant="body" tone={selected ? 'default' : 'muted'}>
            {selected?.label ?? placeholder ?? '—'}
          </Text>
        </Pressable>
      </View>
      <Sheet visible={open} title={label} anchor={anchor} onClose={() => setOpen(false)}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={({ pressed }) => ({
                paddingVertical: theme.spacing.md,
                paddingHorizontal: theme.spacing.sm,
                borderRadius: theme.radius.md,
                backgroundColor: active
                  ? theme.colors.secondary
                  : pressed
                    ? theme.colors.surfaceMuted
                    : 'transparent',
              })}
            >
              <Text variant="body" weight={active ? 'semibold' : 'regular'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </Sheet>
    </View>
  );
}
