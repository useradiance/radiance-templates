import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { StateView } from '@/components/ui/StateView';
import { hasRole, useClaims } from '@/hooks/useClaims';
import { useTheme } from '@/lib/theme';

type Props = { role: string; children: ReactNode; fallback?: ReactNode };

export function RequireRole({ role, children, fallback }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { claims, loading } = useClaims(true);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StateView kind="loading" title={t('roles.checking')} />
      </View>
    );
  }

  if (!hasRole(claims, role)) {
    return (
      fallback ?? (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <StateView kind="error" title={t('roles.denied')} description={t('roles.deniedHint')} />
        </View>
      )
    );
  }

  return <>{children}</>;
}
