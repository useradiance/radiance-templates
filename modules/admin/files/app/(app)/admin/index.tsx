import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { UsersAdminList } from '@/components/UsersAdminList';
import { RequireRole } from '@/components/RequireRole';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useClaims } from '@/hooks/useClaims';
import { useResponsive } from '@/hooks/useResponsive';
import { bootstrapFirstAdmin } from '@/lib/admin';
import { useTheme } from '@/lib/theme';

export default function AdminHome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const { claims, refresh } = useClaims(true);
  const isAdmin = claims?.admin === true || claims?.role === 'admin';
  const [busy, setBusy] = useState(false);

  const body = !isAdmin ? (
    <Screen scroll width="wide">
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          gap: theme.spacing.xl,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: 1, gap: theme.spacing.md, width: '100%' }}>
          <Text variant="display">{t('admin.title')}</Text>
          <Text variant="body" tone="muted">
            {t('admin.bootstrapHint')}
          </Text>
          <Card>
            <View style={{ gap: theme.spacing.md }}>
              <Text variant="subtitle">{t('admin.claimTitle')}</Text>
              <Text variant="body" tone="muted">
                {t('admin.claimHint')}
              </Text>
              <Button
                title={t('admin.becomeAdmin')}
                loading={busy}
                fullWidth
                onPress={() => {
                  setBusy(true);
                  void bootstrapFirstAdmin()
                    .then(async (result) => {
                      await refresh();
                      toast(
                        result.already ? t('admin.alreadyTaken') : t('admin.youAreAdmin'),
                        'success',
                      );
                    })
                    .catch(() => toast(t('admin.bootstrapError'), 'danger'))
                    .finally(() => setBusy(false));
                }}
              />
            </View>
          </Card>
        </View>
        <View style={{ flex: isDesktop ? 1.2 : undefined, width: '100%', minHeight: 320 }}>
          <UsersAdminList canManageRoles={false} />
        </View>
      </View>
    </Screen>
  ) : (
    <RequireRole role="admin">
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={{
            flex: 1,
            flexDirection: isDesktop ? 'row' : 'column',
            gap: theme.spacing.lg,
          }}
        >
          <View
            style={{
              width: isDesktop ? 320 : '100%',
              padding: theme.spacing.lg,
              gap: theme.spacing.md,
            }}
          >
            <Text variant="display">{t('admin.title')}</Text>
            <Text variant="body" tone="muted">
              {t('admin.ready')}
            </Text>
            <Card>
              <Text variant="body" tone="muted">
                {t('admin.manageHint')}
              </Text>
            </Card>
          </View>
          <View style={{ flex: 1, minHeight: 360 }}>
            <UsersAdminList canManageRoles />
          </View>
        </View>
      </View>
    </RequireRole>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('admin.title') }} />
      {body}
    </>
  );
}
