import { Alert } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { Button } from '@/components/ui/Button';
import { reportContent } from '@/lib/moderation';
import { useAuthStore } from '@/stores/auth';

type Props = { targetPath: string };

export function ReportButton({ targetPath }: Props) {
  const { t } = useTranslation();
  const uid = useAuthStore((s) => s.user?.uid);
  const [busy, setBusy] = useState(false);

  const submit = async (reason: string) => {
    if (!uid || !reason.trim()) return;
    setBusy(true);
    try {
      await reportContent({ targetPath, reason: reason.trim(), reporterId: uid });
      Alert.alert(t('moderation.thanks'));
    } finally {
      setBusy(false);
    }
  };

  const onPress = () => {
    if (!uid) return;
    if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
      Alert.prompt(t('moderation.reportTitle'), t('moderation.reportHint'), (reason) => {
        void submit(reason ?? '');
      });
      return;
    }
    void submit(t('moderation.reportHint'));
  };

  return <Button title={t('moderation.report')} onPress={onPress} disabled={busy || !uid} />;
}
