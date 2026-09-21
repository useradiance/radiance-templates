import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { ListRow } from '@/components/ui/ListRow';
import { Text } from '@/components/ui/Text';
import { deleteCurrentAccount } from '@/lib/delete-account';
import { logger } from '@/lib/logger';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

/** Account block for the settings screen: identity, verification state, delete and sign-out. */
export function AccountSettingsSection() {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="label" tone="muted">
        {t('auth.account')}
      </Text>

      <EmailVerificationBanner />

      <ListRow
        title={user.isAnonymous ? t('auth.guest') : (user.displayName ?? t('auth.noName'))}
        subtitle={user.email ?? undefined}
      />

      <ListRow
        title={deleting ? t('auth.deletingAccount') : t('auth.deleteAccount')}
        destructive
        onPress={() => {
          if (deleting) return;
          setDeleting(true);
          void deleteCurrentAccount()
            .catch((error) => {
              logger.error('deleteAccount failed', error);
            })
            .finally(() => setDeleting(false));
        }}
      />

      <ListRow title={t('auth.signOut')} destructive onPress={() => void signOut()} />
    </View>
  );
}
