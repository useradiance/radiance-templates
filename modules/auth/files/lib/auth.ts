import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseAuth from 'firebase/auth';
import { connectAuthEmulator, getAuth, initializeAuth, type Auth } from 'firebase/auth';

import { emulatorHost, useAuthEmulator } from '@/lib/env';
import { getFirebaseApp } from '@/lib/firebase';
import { isWeb } from '@/lib/platform';

const AUTH_EMULATOR_PORT = 9099;

/**
 * `getReactNativePersistence` only exists in the React Native build of `firebase/auth`,
 * so it is absent from the package's published typings. Metro resolves it at runtime.
 */
type ReactNativePersistenceFactory = (storage: unknown) => firebaseAuth.Persistence;

let auth: Auth | undefined;

export function getFirebaseAuth(): Auth {
  if (auth) return auth;

  const app = getFirebaseApp();

  if (isWeb) {
    auth = getAuth(app);
  } else {
    const getReactNativePersistence = (
      firebaseAuth as unknown as {
        getReactNativePersistence?: ReactNativePersistenceFactory;
      }
    ).getReactNativePersistence;

    try {
      auth = getReactNativePersistence
        ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
        : initializeAuth(app);
    } catch {
      // Fast refresh re-runs this module while the instance already exists.
      auth = getAuth(app);
    }
  }

  if (useAuthEmulator) {
    connectAuthEmulator(auth, `http://${emulatorHost}:${AUTH_EMULATOR_PORT}`, {
      disableWarnings: true,
    });
  }

  return auth;
}
