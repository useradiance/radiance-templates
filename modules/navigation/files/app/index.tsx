import { Redirect } from 'expo-router';

import { StateView } from '@/components/ui/StateView';
import { useSession } from '@/lib/registry/session';

/** Entry route: sends the user to the app or to sign-in once the session is known. */
export default function IndexRoute() {
  const { isLoading, isAuthenticated } = useSession();

  if (process.env.EXPO_PUBLIC_UI_PREVIEW === 'true') {
    return <Redirect href="/(app)" />;
  }

  if (isLoading) {
    return <StateView kind="loading" />;
  }

  return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/sign-in'} />;
}
