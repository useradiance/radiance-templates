import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { authProviders } from '@/lib/auth-config';
import { authErrorKey } from '@/lib/auth-errors';
import {
  isAppleSignInSupported,
  isGoogleSignInConfigured,
  signInWithApple,
  useGoogleSignIn,
} from '@/lib/social-auth';
import { useTheme } from '@/lib/theme';

/** Google and Apple sign-in. Hidden entirely when neither social provider is enabled. */
export function SocialAuthButtons() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, setPending] = useState<'google' | 'apple' | null>(null);

  const google = useGoogleSignIn((error) => setErrorKey(authErrorKey(error)));

  const showGoogle = authProviders.google;
  const showApple = authProviders.apple && isAppleSignInSupported;
  const googleReady = isGoogleSignInConfigured;

  if (!showGoogle && !showApple) return null;

  const runGoogle = async () => {
    setErrorKey(null);
    setPending('google');
    try {
      await google.signIn();
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setPending(null);
    }
  };

  const runApple = async () => {
    setErrorKey(null);
    setPending('apple');
    try {
      await signInWithApple();
    } catch (error) {
      setErrorKey(authErrorKey(error));
    } finally {
      setPending(null);
    }
  };

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Text variant="caption" tone="muted" center>
        {t('auth.orContinueWith')}
      </Text>

      {showGoogle ? (
        <Button
          title={t('auth.continueWithGoogle')}
          variant="secondary"
          fullWidth
          loading={pending === 'google'}
          disabled={!googleReady || !google.isReady}
          leading={<Ionicons name="logo-google" size={18} color={theme.colors.text} />}
          onPress={runGoogle}
        />
      ) : null}

      {showApple ? (
        <Button
          title={t('auth.continueWithApple')}
          variant="secondary"
          fullWidth
          loading={pending === 'apple'}
          leading={<Ionicons name="logo-apple" size={18} color={theme.colors.text} />}
          onPress={runApple}
        />
      ) : null}

      {errorKey ? (
        <Text variant="caption" tone="danger" center>
          {t(errorKey)}
        </Text>
      ) : null}
    </View>
  );
}
