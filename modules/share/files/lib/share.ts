import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

export type ShareOutcome = 'shared' | 'copied' | 'dismissed';

let inFlight: Promise<ShareOutcome> | null = null;

function combinedText(message: string, url?: string): string {
  return url ? `${message}\n${url}` : message;
}

function errorText(error: unknown): { name: string; message: string } {
  if (!error || typeof error !== 'object') {
    return { name: '', message: String(error ?? '') };
  }
  return {
    name: 'name' in error ? String(error.name) : '',
    message: 'message' in error ? String(error.message) : '',
  };
}

function isDismissed(error: unknown): boolean {
  const { name, message } = errorText(error);
  return (
    name === 'AbortError' ||
    /abort/i.test(message) ||
    /cancel/i.test(message) ||
    /dismiss/i.test(message)
  );
}

async function performShare(message: string, url?: string): Promise<ShareOutcome> {
  const text = combinedText(message, url);
  const content = Platform.OS === 'ios' ? { message, url } : { message: text };

  try {
    await Share.share(content);
    return 'shared';
  } catch (error) {
    if (isDismissed(error)) return 'dismissed';
    await copyToClipboard(text);
    return 'copied';
  }
}

/**
 * Opens the system share sheet. User cancel is ignored. Web InvalidStateError
 * (an earlier share still open) and other failures copy the text instead.
 */
export async function shareText(message: string, url?: string): Promise<ShareOutcome> {
  if (inFlight) {
    try {
      await inFlight;
    } catch {
      // Previous attempt settled; continue with this one.
    }
  }

  const run = performShare(message, url);
  inFlight = run;
  try {
    return await run;
  } finally {
    if (inFlight === run) inFlight = null;
  }
}

export async function copyToClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/**
 * Absolute URL for sharing. Prefers EXPO_PUBLIC_DEEP_LINK_HOST, otherwise
 * Expo Linking (scheme / localhost / tunnel) so the link actually opens the app.
 */
export function buildShareUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const host = process.env.EXPO_PUBLIC_DEEP_LINK_HOST?.trim();
  if (host) {
    const clean = host.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${clean}${normalized}`;
  }
  return Linking.createURL(normalized);
}
