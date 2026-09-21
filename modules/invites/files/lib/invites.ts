import * as Linking from 'expo-linking';

import { call } from '@/lib/callable';

function inviteUrl(code: string): string {
  const path = `/invite/${code}`;
  const host = process.env.EXPO_PUBLIC_DEEP_LINK_HOST?.trim();
  if (host) {
    const normalized = host.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${normalized}${path}`;
  }
  // Expo scheme / tunnel / localhost — opens the app (or web origin) at the invite route.
  return Linking.createURL(path);
}

export async function createInvite(input?: {
  targetType?: string;
  targetId?: string;
}): Promise<{ code: string; url: string }> {
  const { code } = await call('createInvite', input ?? {});
  return { code, url: inviteUrl(code) };
}

export async function acceptInvite(code: string) {
  return call('acceptInvite', { code });
}
