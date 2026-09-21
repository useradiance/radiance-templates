import { Slot, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

/**
 * Folder routes default to the file path (`admin/index`) as the stack title.
 * This layout is the parent stack screen named `admin` and sets a real title
 * for every `/admin` route, including future nested admin pages.
 */
export default function AdminLayout() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('admin.title') }} />
      <Slot />
    </>
  );
}
