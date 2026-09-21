import { Platform } from 'react-native';

import { getFirebaseAuth } from '@/lib/auth';

let configured = false;

async function purchases() {
  if (Platform.OS === 'web') return null;
  return import('react-native-purchases');
}

export async function configureIap(): Promise<void> {
  if (configured || Platform.OS === 'web') return;
  const key = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
  if (!key) return;
  const Purchases = await purchases();
  if (!Purchases) return;
  Purchases.default.configure({ apiKey: key });
  const uid = getFirebaseAuth().currentUser?.uid;
  if (uid) await Purchases.default.logIn(uid);
  configured = true;
}

export async function purchaseCurrentOffering(): Promise<boolean> {
  await configureIap();
  const Purchases = await purchases();
  if (!Purchases) return false;
  const offerings = await Purchases.default.getOfferings();
  const pkg = offerings.current?.availablePackages[0];
  if (!pkg) return false;
  await Purchases.default.purchasePackage(pkg);
  return true;
}
