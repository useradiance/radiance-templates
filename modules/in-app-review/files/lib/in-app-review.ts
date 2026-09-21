import * as StoreReview from 'expo-store-review';

import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'radiance.in-app-review' });
const KEY = 'lastPromptAt';
const COOLDOWN_MS = 1000 * 60 * 60 * 24 * 90;

export async function maybeRequestReview(): Promise<boolean> {
  const last = storage.getNumber(KEY) ?? 0;
  if (Date.now() - last < COOLDOWN_MS) return false;
  if (!(await StoreReview.isAvailableAsync())) return false;
  await StoreReview.requestReview();
  storage.set(KEY, Date.now());
  return true;
}
