import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppHeader } from '@/components/ui/AppHeader';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { appointmentsQuery, asDate, type Appointment } from '@/lib/booking';
import { DEMO_SERVICES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import { useAuthStore } from '@/stores/auth';

export default function AppointmentsScreen() {
  const { t } = useTranslation();
  const { containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? 'preview');
  const { data: live, isLoading } = useCollection<Appointment>(
    () => appointmentsQuery(uid),
    uid ? `appointments:${uid}` : null,
  );

  const fallback: Appointment[] = [
    {
      id: 'demo-appt-1',
      serviceId: 'demo-cut',
      userId: uid,
      startsAt: new Date(Date.now() + 86400000),
      status: 'booked',
    },
  ];
  const data = withDemoFallback(live, fallback);

  return (
    <Screen padded={false} width="full">
      <List
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <AppHeader
            title={t('booking.appointments')}
            subtitle={t('booking.appointmentsSubtitle')}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('booking.noAppointments')} />
          )
        }
        renderItem={({ item }) => {
          const service = DEMO_SERVICES.find((entry) => entry.id === item.serviceId);
          const when = asDate(item.startsAt).toLocaleString();
          return (
            <Card>
              <Text variant="subtitle">{service?.name ?? item.serviceId}</Text>
              <Text variant="body" tone="muted">
                {when}
              </Text>
              <View>
                <Text variant="caption" tone="primary">
                  {item.status}
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}
