import { Platform } from 'react-native';
import { Redirect } from 'expo-router';

import { StateView } from '@/components/ui/StateView';
import { useSession } from '@/lib/registry/session';

/** Entry route: app for signed-in users; marketing on web; sign-in on native. */
export default function IndexRoute() {
  const { isLoading, isAuthenticated } = useSession();

  if (process.env.EXPO_PUBLIC_UI_PREVIEW === 'true') {
    return <Redirect href="/(app)" />;
  }

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  if (Platform.OS === 'web') {
    return <Redirect href="/(marketing)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
