import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { MediaImage } from '@/components/ui/MediaImage';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export default function MarketingHome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();

  return (
    <Screen scroll width="full" padded={false}>
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          minHeight: isDesktop ? 520 : undefined,
        }}
      >
        <View
          style={{
            flex: 1,
            gap: theme.spacing.lg,
            padding: theme.spacing.xxl,
            justifyContent: 'center',
            maxWidth: isDesktop ? 640 : undefined,
          }}
        >
          <Text variant="caption" tone="muted">
            {t('landing.heroEyebrow')}
          </Text>
          <Text variant="display">{t('landing.heroTitle')}</Text>
          <Text variant="body" tone="muted">
            {t('landing.heroBody')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <Button
              title={t('landing.getStarted')}
              onPress={() => router.push('/(auth)/sign-in')}
            />
            <Button
              title={t('landing.createAccount')}
              variant="secondary"
              onPress={() => router.push('/(auth)/sign-up')}
            />
          </View>
        </View>
        <View style={{ flex: 1, minHeight: 280 }}>
          <MediaImage
            uri="https://picsum.photos/seed/radiance-landing/1600/1200"
            aspectRatio={isDesktop ? 4 / 3 : 16 / 9}
            radius="none"
            accessibilityLabel=""
          />
        </View>
      </View>

      <View
        style={{
          padding: theme.spacing.xxl,
          gap: theme.spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg }}>
          {(
            [
              ['landing.feature1Title', 'landing.feature1Body'],
              ['landing.feature2Title', 'landing.feature2Body'],
              ['landing.feature3Title', 'landing.feature3Body'],
            ] as const
          ).map(([titleKey, bodyKey]) => (
            <View
              key={titleKey}
              style={{
                flexGrow: 1,
                flexBasis: 240,
                gap: theme.spacing.sm,
                padding: theme.spacing.lg,
                borderRadius: theme.radius.xl,
                borderWidth: 1,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Text variant="subtitle">{t(titleKey)}</Text>
              <Text variant="body" tone="muted">
                {t(bodyKey)}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={{
            paddingTop: theme.spacing.xl,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Text variant="caption" tone="muted">
            {t('landing.footer')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
