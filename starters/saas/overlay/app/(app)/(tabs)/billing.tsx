import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { isEntitled, useEntitlement } from '@/hooks/useEntitlement';
import { useResponsive } from '@/hooks/useResponsive';
import { useRemoteFlag } from '@/lib/remote-config-provider';
import { openBillingPortal, startSubscriptionCheckout } from '@/lib/subscriptions';
import { useTheme } from '@/lib/theme';

export default function BillingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const { data } = useEntitlement();
  const billingEnabled = useRemoteFlag('feature_billing_enabled');
  const entitled = isEntitled(data);

  return (
    <Screen scroll width="wide">
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: 'flex-start',
          gap: theme.spacing.xl,
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.md, width: '100%' }}>
          <SectionHeader title={t('saas.billing')} subtitle={t('saas.billingSubtitle')} />
          <Card>
            <Text variant="subtitle">{entitled ? t('saas.active') : t('saas.inactive')}</Text>
            <Text variant="body" tone="muted">
              {billingEnabled ? t('saas.billingSubtitle') : t('saas.billingDisabled')}
            </Text>
          </Card>
        </View>
        <View
          style={{
            flex: 1,
            gap: theme.spacing.md,
            width: '100%',
            maxWidth: isDesktop ? 420 : undefined,
          }}
        >
          {billingEnabled ? (
            <Card>
              <View style={{ gap: theme.spacing.md }}>
                <SectionHeader title={t('saas.manage')} size="section" />
                <Button
                  title={t('saas.subscribe')}
                  onPress={async () => {
                    const priceId = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID;
                    if (!priceId) return;
                    const { url } = await startSubscriptionCheckout({
                      priceId,
                      successUrl: Linking.createURL('/billing'),
                      cancelUrl: Linking.createURL('/billing'),
                    });
                    await Linking.openURL(url);
                  }}
                  fullWidth
                />
                <Button
                  title={t('saas.manage')}
                  variant="secondary"
                  onPress={async () => {
                    const url = await openBillingPortal(Linking.createURL('/billing'));
                    await Linking.openURL(url);
                  }}
                  fullWidth
                />
              </View>
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
