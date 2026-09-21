import { Slot, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/** Folder routes default to `chat/index` as the stack title without this layout. */
export default function ChatLayout() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('chat.inbox') }} />
      <Slot />
    </>
  );
}
