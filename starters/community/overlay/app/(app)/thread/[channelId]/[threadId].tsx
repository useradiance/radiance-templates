import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { doc } from 'firebase/firestore';

import { CommentsSection } from '@/components/CommentsSection';
import { ReportButton } from '@/components/ReportButton';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { useDocument } from '@/hooks/useDocument';
import type { Thread } from '@/lib/community';
import { getDb } from '@/lib/firestore';

export default function ThreadScreen() {
  const { channelId, threadId } = useLocalSearchParams<{ channelId: string; threadId: string }>();
  const { t } = useTranslation();
  const parentPath = `channels/${channelId}/threads/${threadId}`;
  const { data, isLoading } = useDocument<Thread>(
    () => doc(getDb(), 'channels', channelId, 'threads', threadId),
    threadId ? `thread:${threadId}` : null,
  );

  const title = data?.title ?? t('community.thread');

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title }} />
        <StateView kind="loading" />
      </>
    );
  }

  return (
    <Screen scroll>
      <Stack.Screen options={{ title }} />
      <Text variant="title">{data?.title ?? t('community.thread')}</Text>
      <ReportButton targetPath={parentPath} />
      <CommentsSection parentPath={parentPath} />
    </Screen>
  );
}
