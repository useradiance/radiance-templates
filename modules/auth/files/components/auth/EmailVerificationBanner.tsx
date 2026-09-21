import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { enforceEmailVerification } from '@/lib/auth-config';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

/**
 * Prompts unverified users to confirm their email.
 * When `enforceEmailVerification` is enabled, copy stresses that access is restricted.
 */
export function EmailVerificationBanner() {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const resend = useAuthStore((state) => state.resendVerificationEmail);
  const [sent, setSent] = useState(false);

  if (!user || user.isAnonymous || user.emailVerified) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surfaceMuted,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text variant="caption" tone="muted" style={{ flex: 1 }}>
        {sent
          ? t('auth.verificationSent')
          : enforceEmailVerification
            ? t('auth.verifyEmailRequired')
            : t('auth.verifyEmailPrompt')}
      </Text>
      {sent ? null : (
        <Button
          title={t('auth.resend')}
          size="sm"
          variant="ghost"
          onPress={async () => {
            if (await resend()) setSent(true);
          }}
        />
      )}
    </View>
  );
}
