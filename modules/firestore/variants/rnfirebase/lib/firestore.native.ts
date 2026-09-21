/**
 * RNFirebase Firestore entry — enables disk persistence across app restarts on native.
 * Requires a development build (`@react-native-firebase/app` + `@react-native-firebase/firestore`).
 * Not compatible with Expo Go.
 */
import { getFirestore } from '@react-native-firebase/firestore';

export function getNativeFirestore() {
  return getFirestore();
}

export function enableNativePersistence(): void {
  // Modular RNFirebase enables persistence by default on native.
}
