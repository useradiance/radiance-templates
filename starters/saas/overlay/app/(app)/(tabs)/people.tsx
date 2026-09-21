import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { UsersAdminList } from '@/components/UsersAdminList';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { useClaims } from '@/hooks/useClaims';
import { useResponsive } from '@/hooks/useResponsive';
import { useTheme } from '@/lib/theme';

export default function PeopleScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { claims } = useClaims(true);
  const isAdmin = claims?.admin === true || claims?.role === 'admin';

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          flexDirection: isDesktop ? 'row' : 'column',
        }}
      >
        <View
          style={{
            width: isDesktop ? 320 : '100%',
            padding: theme.spacing.lg,
            gap: theme.spacing.md,
            borderRightWidth: isDesktop ? 1 : 0,
            borderBottomWidth: isDesktop ? 0 : 1,
            borderColor: theme.colors.border,
          }}
        >
          <SectionHeader title={t('saas.people')} subtitle={t('saas.peopleSubtitle')} />
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="body" tone="muted">
                {isAdmin ? t('saas.peopleAdminHint') : t('saas.peopleMemberHint')}
              </Text>
              <Button
                title={t('admin.openConsole')}
                variant={isAdmin ? 'primary' : 'secondary'}
                fullWidth
                onPress={() => router.push('/admin')}
              />
            </View>
          </Card>
        </View>
        <View style={{ flex: 1, minHeight: 360 }}>
          <UsersAdminList
            canManageRoles={isAdmin}
            title={t('saas.peopleDirectory')}
            subtitle={t('saas.peopleListSubtitle')}
          />
        </View>
      </View>
    </View>
  );
}
