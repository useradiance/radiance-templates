import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HabitCard } from '@/components/HabitCard';
import { MonthCalendar } from '@/components/MonthCalendar';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { FeedLayout } from '@/components/ui/FeedLayout';
import { List } from '@/components/ui/List';
import { Progress } from '@/components/ui/Progress';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { isoDatesToMarkedDays } from '@/lib/calendar';
import { haptic } from '@/lib/haptics';
import { withDemoFallback } from '@/lib/demo-fallback';
import { checkIn, createHabit, habitsQuery, type Habit } from '@/lib/habits';
import { DEMO_HABITS } from '@/lib/demo-content';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function HabitsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { containerPadding, isDesktop } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [name, setName] = useState('');
  const [reminderHour, setReminderHour] = useState('8');
  const [open, setOpen] = useState(false);
  const [month] = useState(() => new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: live, isLoading } = useCollection<Habit>(
    () => habitsQuery(uid!),
    uid ? `habits:${uid}` : null,
  );
  const data = withDemoFallback(live, DEMO_HABITS);
  const done = data.filter((habit) => habit.lastCheckInDate).length;
  const selected = data.find((habit) => habit.id === selectedId) ?? data[0];
  const markedDays = isoDatesToMarkedDays(selected?.history ?? []);

  const rail = (
    <View style={{ gap: theme.spacing.md }}>
      <Card>
        <Text variant="subtitle">{t('habits.today')}</Text>
        <Text variant="caption" tone="muted">
          {done} / {data.length}
        </Text>
        <Progress value={data.length ? done / data.length : 0} />
      </Card>
      {selected ? (
        <Card>
          <Text variant="subtitle">{selected.name}</Text>
          <Text variant="caption" tone="muted">
            {t('habits.history')}
          </Text>
          <MonthCalendar month={month} markedDays={markedDays} />
        </Card>
      ) : null}
    </View>
  );

  return (
    <Screen padded={false} width="full">
      <FeedLayout rail={rail}>
        <List
          data={data}
          keyExtractor={(item) => item.id}
          gap="md"
          width="full"
          contentContainerStyle={{ padding: containerPadding }}
          ListHeaderComponent={
            <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              <AppHeader
                title={t('habits.title')}
                subtitle={t('habits.subtitle')}
                trailing={
                  <Button title={t('habits.add')} size="sm" onPress={() => setOpen(true)} />
                }
              />
              {!isDesktop && selected ? (
                <Card>
                  <Text variant="subtitle">{selected.name}</Text>
                  <Text variant="caption" tone="muted">
                    {t('habits.history')}
                  </Text>
                  <MonthCalendar month={month} markedDays={markedDays} />
                </Card>
              ) : null}
            </View>
          }
          ListEmptyComponent={isLoading ? <StateView kind="loading" /> : <StateView kind="empty" />}
          renderItem={({ item }) => (
            <HabitCard
              habit={item}
              checkInLabel={t('habits.streak', { count: item.streak ?? 0 })}
              onPress={() => {
                setSelectedId(item.id);
                void checkIn(item).then(() => {
                  void haptic('success');
                  toast(t('habits.checkedIn'), 'success');
                });
              }}
            />
          )}
        />
      </FeedLayout>
      <Dialog visible={open} title={t('habits.new')} onClose={() => setOpen(false)}>
        <TextField label={t('habits.new')} value={name} onChangeText={setName} />
        <TextField
          label={t('habits.reminderHour')}
          value={reminderHour}
          onChangeText={setReminderHour}
          keyboardType="number-pad"
          placeholder="8"
        />
        <Button
          title={t('habits.add')}
          onPress={async () => {
            if (!uid || !name.trim()) return;
            const hour = Number(reminderHour);
            await createHabit(
              uid,
              name,
              Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : null,
            );
            setName('');
            setOpen(false);
          }}
        />
      </Dialog>
    </Screen>
  );
}
