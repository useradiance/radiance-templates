import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme/context';

export type ToastTone = 'default' | 'success' | 'danger';

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

let nextId = 1;
let queue: ToastItem[] = [];
const listeners = new Set<(items: ToastItem[]) => void>();

function emit(): void {
  for (const listener of listeners) listener(queue);
}

/** Show a short-lived toast. Prefer this over Alert for non-blocking feedback. */
export function toast(message: string, tone: ToastTone = 'default'): void {
  const id = `toast-${nextId++}`;
  queue = [...queue, { id, message, tone }];
  emit();
  setTimeout(() => {
    queue = queue.filter((item) => item.id !== id);
    emit();
  }, 2800);
}

/** Host rendered by ThemeProvider. Do not mount a second copy. */
export function ToastHost() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ToastItem[]>(queue);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        bottom: insets.bottom + theme.spacing.lg,
        gap: theme.spacing.sm,
        alignItems: 'center',
      }}
    >
      {items.map((item) => (
        <View
          key={item.id}
          style={{
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor:
              item.tone === 'danger'
                ? theme.colors.danger
                : item.tone === 'success'
                  ? theme.colors.success
                  : theme.colors.surfaceElevated,
            maxWidth: 420,
            width: '100%',
            ...theme.elevation.medium,
          }}
        >
          <Text
            variant="label"
            style={{
              color: item.tone === 'default' ? theme.colors.text : theme.colors.textInverted,
              textAlign: 'center',
            }}
          >
            {item.message}
          </Text>
        </View>
      ))}
    </View>
  );
}
