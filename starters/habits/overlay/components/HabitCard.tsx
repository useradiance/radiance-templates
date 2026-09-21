import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import type { Habit } from '@/lib/habits';
import { useTheme } from '@/lib/theme';

export function HabitCard({
  habit,
  onPress,
  checkInLabel,
}: {
  habit: Habit;
  onPress: () => void;
  checkInLabel: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: theme.spacing.xs }}>
            <Text variant="subtitle">{habit.name}</Text>
            <Text variant="caption" tone="muted">
              {checkInLabel}
            </Text>
          </View>
          <Badge label={`${habit.streak ?? 0}`} tone="primary" />
        </View>
      </Card>
    </Pressable>
  );
}
