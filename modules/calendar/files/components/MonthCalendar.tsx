import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { monthDays } from '@/lib/calendar';
import { useTheme } from '@/lib/theme';

type Props = {
  month: Date;
  selected?: Date | null;
  onSelectDay?: (day: Date) => void;
  markedDays?: Set<string>;
};

function keyFor(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function MonthCalendar({ month, selected, onSelectDay, markedDays }: Props) {
  const theme = useTheme();
  const days = monthDays(month);
  const selectedKey = selected ? keyFor(selected) : null;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row' }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
          <View key={`${label}-${index}`} style={{ width: '14.28%', alignItems: 'center' }}>
            <Text variant="caption" tone="muted">
              {label}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day) => {
          const inMonth = day.getMonth() === month.getMonth();
          const key = keyFor(day);
          const isSelected = key === selectedKey;
          return (
            <Pressable
              key={key + String(day.getTime())}
              onPress={() => onSelectDay?.(day)}
              style={{
                width: '14.28%',
                aspectRatio: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.radius.md,
                backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                opacity: inMonth ? 1 : 0.35,
              }}
            >
              <Text
                variant="caption"
                style={{ color: isSelected ? theme.colors.primaryText : theme.colors.text }}
              >
                {day.getDate()}
              </Text>
              {markedDays?.has(key) ? (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    marginTop: 2,
                    backgroundColor: isSelected ? theme.colors.primaryText : theme.colors.primary,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
