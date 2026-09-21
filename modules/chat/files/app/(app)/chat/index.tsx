import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ChatInbox } from '@/components/ChatInbox';

export default function ChatInboxScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('chat.inbox') }} />
      <ChatInbox />
    </>
  );
}
