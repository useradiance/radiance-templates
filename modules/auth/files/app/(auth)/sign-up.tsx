import { Link, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { hasEmailAuth, hasSocialAuth } from '@/lib/auth-config';
import { signUpSchema } from '@/lib/auth-schemas';
import { useAppForm } from '@/lib/forms';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const signUp = useAuthStore((state) => state.signUpWithEmail);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const errorKey = useAuthStore((state) => state.errorKey);

  const { control, handleSubmit } = useAppForm({
    schema: signUpSchema,
    defaultValues: { displayName: '', email: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  if (!hasEmailAuth) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Screen scroll width="form" align="center">
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xxl }}>
        <Text variant="display">{t('auth.signUpTitle')}</Text>
        <Text variant="body" tone="muted">
          {t('auth.signUpSubtitle')}
        </Text>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <FormField
          control={control}
          name="displayName"
          label={t('auth.displayName')}
          autoComplete="name"
          textContentType="name"
        />
        <FormField
          control={control}
          name="email"
          label={t('auth.email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <FormField
          control={control}
          name="password"
          label={t('auth.password')}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          helper={t('auth.passwordHelper', { count: 8 })}
        />

        {errorKey ? (
          <Text variant="caption" tone="danger">
            {t(errorKey)}
          </Text>
        ) : null}

        <Button
          title={t('auth.createAccount')}
          fullWidth
          loading={isSubmitting}
          onPress={handleSubmit((values) =>
            signUp(values.email, values.password, values.displayName),
          )}
        />
      </View>

      {hasSocialAuth ? <SocialAuthButtons /> : null}

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}>
        <Text variant="label" tone="muted">
          {t('auth.haveAccount')}
        </Text>
        <Link href="/(auth)/sign-in" asChild>
          <Text variant="label" tone="primary">
            {t('auth.signIn')}
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
