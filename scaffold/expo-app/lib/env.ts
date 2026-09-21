/**
 * Firebase configuration is read from `EXPO_PUBLIC_*` variables so Metro can inline
 * them at build time. Each variable must be referenced statically — dynamic lookups
 * such as `process.env[name]` are not inlined and resolve to `undefined` at runtime.
 */
export type FirebaseEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const rawEnv = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const REQUIRED_KEYS = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

export function getMissingFirebaseEnvKeys(): string[] {
  return REQUIRED_KEYS.filter((key) => !rawEnv[key]);
}

export function isFirebaseConfigured(): boolean {
  return getMissingFirebaseEnvKeys().length === 0;
}

export function getFirebaseEnv(): FirebaseEnv {
  const missing = getMissingFirebaseEnvKeys();
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missing.join(', ')}. Copy .env.example to .env and fill in your project values.`,
    );
  }
  return rawEnv as FirebaseEnv;
}

/** Master switch — emulators are opt-in so a misconfigured device never silently talks to localhost. */
export const useFirebaseEmulators = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS === 'true';

/**
 * LAN IP or hostname of the machine running emulators.
 * Use your computer's LAN address when testing on a physical device.
 */
export const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? 'localhost';

/**
 * Per-product emulator toggles (IRL-style). When the master switch is on, each product
 * defaults to enabled unless explicitly set to `"false"`.
 */
function emulatorEnabled(flag: string | undefined): boolean {
  if (!useFirebaseEmulators) return false;
  if (flag === 'false') return false;
  return true;
}

export const useAuthEmulator = emulatorEnabled(process.env.EXPO_PUBLIC_EMULATOR_AUTH);
export const useFirestoreEmulator = emulatorEnabled(process.env.EXPO_PUBLIC_EMULATOR_FIRESTORE);
export const useFunctionsEmulator = emulatorEnabled(process.env.EXPO_PUBLIC_EMULATOR_FUNCTIONS);
export const useStorageEmulator = emulatorEnabled(process.env.EXPO_PUBLIC_EMULATOR_STORAGE);
