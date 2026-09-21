import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { hasEmailAuth } from '@/lib/auth-config';
import { forgotPasswordSchema } from '@/lib/auth-schemas';
import { useAppForm } from '@/lib/forms';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const sendPasswordReset = useAuthStore((state) => state.sendPasswordReset);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const errorKey = useAuthStore((state) => state.errorKey);

  const { control, handleSubmit } = useAppForm({
    schema: forgotPasswordSchema,
    defaultValues: { email: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  if (!hasEmailAuth) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Screen scroll width="form" align="center">
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xxl }}>
        <Text variant="display">{t('auth.resetTitle')}</Text>
        <Text variant="body" tone="muted">
          {sentEmail ? t('auth.resetSent', { email: sentEmail }) : t('auth.resetSubtitle')}
        </Text>
      </View>

      {sentEmail ? (
        <Button
          title={t('common.back')}
          variant="secondary"
          fullWidth
          onPress={() => router.back()}
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          <FormField
            control={control}
            name="email"
            label={t('auth.email')}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
          />

          {errorKey ? (
            <Text variant="caption" tone="danger">
              {t(errorKey)}
            </Text>
          ) : null}

          <Button
            title={t('auth.sendResetLink')}
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit(async (values) => {
              if (await sendPasswordReset(values.email)) setSentEmail(values.email);
            })}
          />
        </View>
      )}
    </Screen>
  );
}
