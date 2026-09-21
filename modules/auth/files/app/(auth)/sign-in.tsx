import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { FormField } from '@/components/forms/FormField';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { hasAnonymousAuth, hasEmailAuth, hasSocialAuth } from '@/lib/auth-config';
import { signInSchema } from '@/lib/auth-schemas';
import { useAppForm } from '@/lib/forms';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function SignInScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const signIn = useAuthStore((state) => state.signInWithEmail);
  const signInAsGuest = useAuthStore((state) => state.signInAsGuest);
  const isSubmitting = useAuthStore((state) => state.isSubmitting);
  const errorKey = useAuthStore((state) => state.errorKey);

  const { control, handleSubmit } = useAppForm({
    schema: signInSchema,
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  return (
    <Screen scroll width="form" align="center">
      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.xxl }}>
        <Text variant="display">{t('auth.signInTitle')}</Text>
        <Text variant="body" tone="muted">
          {t('auth.signInSubtitle')}
        </Text>
      </View>

      {hasEmailAuth ? (
        <View style={{ gap: theme.spacing.md }}>
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
            autoComplete="current-password"
            textContentType="password"
          />

          {errorKey ? (
            <Text variant="caption" tone="danger">
              {t(errorKey)}
            </Text>
          ) : null}

          <Button
            title={t('auth.signIn')}
            fullWidth
            loading={isSubmitting}
            onPress={handleSubmit((values) => signIn(values.email, values.password))}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <Text variant="label" tone="primary" center>
              {t('auth.forgotPassword')}
            </Text>
          </Link>
        </View>
      ) : null}

      {hasSocialAuth ? <SocialAuthButtons /> : null}

      {hasAnonymousAuth ? (
        <Button
          title={t('auth.continueAsGuest')}
          variant="secondary"
          fullWidth
          loading={isSubmitting}
          onPress={() => void signInAsGuest()}
        />
      ) : null}

      {hasEmailAuth ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xs }}>
          <Text variant="label" tone="muted">
            {t('auth.noAccount')}
          </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Text variant="label" tone="primary">
              {t('auth.signUp')}
            </Text>
          </Link>
        </View>
      ) : null}
    </Screen>
  );
}
