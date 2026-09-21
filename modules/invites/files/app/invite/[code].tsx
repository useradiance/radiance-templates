import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StateView } from '@/components/ui/StateView';
import { acceptInvite } from '@/lib/invites';
import { useTheme } from '@/lib/theme';

export default function AcceptInviteScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    acceptInvite(code)
      .then((result) => {
        if (result.targetType === 'workspace' && result.targetId) {
          router.replace(`/workspace/${result.targetId}` as Href);
          return;
        }
        if (result.targetType === 'project' && result.targetId) {
          router.replace(`/project/${result.targetId}` as Href);
          return;
        }
        router.replace('/' as Href);
      })
      .catch(() => setError(t('invites.failed')));
  }, [code, router, t]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StateView
        kind={error ? 'error' : 'loading'}
        title={error ?? t('invites.accepting')}
        description={error ? undefined : t('invites.acceptingHint')}
      />
    </View>
  );
}
