import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ServiceCard } from '@/components/ServiceCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Grid } from '@/components/ui/Grid';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive, useResponsiveColumns } from '@/hooks/useResponsive';
import { servicesQuery, type Service } from '@/lib/booking';
import { DEMO_SERVICES } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';

export default function ServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const numColumns = useResponsiveColumns({ sm: 1, md: 2, lg: 3 });
  const { data: live, isLoading } = useCollection<Service>(() => servicesQuery(), 'services');
  const data = withDemoFallback(live, DEMO_SERVICES);

  return (
    <Screen padded={false} width="full">
      <Grid
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        gap="md"
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <AppHeader title={t('booking.services')} subtitle={t('booking.servicesSubtitle')} />
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('booking.empty')} />
          )
        }
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => router.push(`/book/${item.id}`)} />
        )}
      />
    </Screen>
  );
}
