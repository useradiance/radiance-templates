import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MonthCalendar } from '@/components/MonthCalendar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { ChipRow } from '@/components/ui/CatalogLayout';
import { MediaDetail } from '@/components/ui/MediaDetail';
import { MediaImage } from '@/components/ui/MediaImage';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useDocument } from '@/hooks/useDocument';
import { useResponsive } from '@/hooks/useResponsive';
import { WEEKDAY_NINE_TO_FIVE, formatSlotTime, slotsOnDay } from '@/lib/availability';
import { haptic } from '@/lib/haptics';
import {
  appointmentsForServiceOnDay,
  asDate,
  bookAppointment,
  serviceRef,
  type Appointment,
  type Service,
} from '@/lib/booking';
import { DEMO_SERVICES } from '@/lib/demo-content';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function BookScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const router = useRouter();
  const uid = useAuthStore((s) => s.user?.uid);
  const [month] = useState(() => new Date());
  const [day, setDay] = useState<Date | null>(null);
  const [slotIso, setSlotIso] = useState<string | null>(null);

  const { data: liveService } = useDocument<Service>(
    () => serviceRef(serviceId),
    serviceId ? `service:${serviceId}` : null,
  );
  const service = liveService ?? DEMO_SERVICES.find((item) => item.id === serviceId);

  const dayKey = day ? `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}` : null;
  const { data: booked } = useCollection<Appointment>(
    () => appointmentsForServiceOnDay(serviceId, day!),
    serviceId && dayKey ? `appt:${serviceId}:${dayKey}` : null,
  );

  const slots = useMemo(() => {
    if (!service || !day) return [];
    return slotsOnDay({
      day,
      durationMinutes: service.durationMinutes,
      availability: service.availability ?? WEEKDAY_NINE_TO_FIVE,
      booked: (booked ?? []).map((item) => ({
        startsAt: asDate(item.startsAt),
        durationMinutes: item.durationMinutes ?? service.durationMinutes,
      })),
    });
  }, [service, day, booked]);

  const confirm = async () => {
    if (!uid || !day || !serviceId || !slotIso || !service) return;
    const startsAt = new Date(slotIso);
    await bookAppointment({
      serviceId,
      userId: uid,
      startsAt,
      durationMinutes: service.durationMinutes,
    });
    void haptic('success');
    toast(t('booking.confirmed'), 'success');
    router.replace('/appointments');
  };

  const picker = (
    <View style={{ gap: theme.spacing.lg }}>
      <SectionHeader title={t('booking.pickDay')} subtitle={t('booking.pickDaySubtitle')} />
      <MonthCalendar
        month={month}
        selected={day}
        onSelectDay={(next) => {
          setDay(next);
          setSlotIso(null);
        }}
      />
      <SectionHeader title={t('booking.pickTime')} />
      {day && slots.length === 0 ? (
        <Text variant="caption" tone="muted">
          {t('booking.noSlots')}
        </Text>
      ) : (
        <ChipRow>
          {slots.map((slot) => {
            const value = slot.toISOString();
            return (
              <Chip
                key={value}
                label={formatSlotTime(slot)}
                selected={slotIso === value}
                onPress={() => setSlotIso(value)}
              />
            );
          })}
        </ChipRow>
      )}
      <Button
        title={t('booking.confirm')}
        onPress={confirm}
        disabled={!day || !uid || !slotIso}
        fullWidth={!isDesktop}
      />
    </View>
  );

  return (
    <Screen scroll padded={false} width="full">
      <Stack.Screen options={{ title: service?.name ?? t('booking.services') }} />
      {service ? (
        <MediaDetail
          media={
            <View style={{ gap: theme.spacing.md }}>
              {service.imageUrl ? (
                <MediaImage uri={service.imageUrl} aspectRatio={4 / 3} radius="xl" />
              ) : null}
              <Text variant="display">{service.name}</Text>
              <Text variant="body" tone="muted">
                {service.durationMinutes} min · ${(service.priceInMinorUnits / 100).toFixed(0)}{' '}
                deposit
              </Text>
            </View>
          }
        >
          {picker}
        </MediaDetail>
      ) : (
        picker
      )}
    </Screen>
  );
}
