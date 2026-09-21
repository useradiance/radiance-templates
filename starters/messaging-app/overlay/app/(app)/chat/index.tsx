import { Redirect, Stack } from 'expo-router';

/** Deep links to `/chat` land on the Messages tab instead of a stacked duplicate. */
export default function ChatIndexRedirect() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Redirect href="/(app)/(tabs)" />
    </>
  );
}
