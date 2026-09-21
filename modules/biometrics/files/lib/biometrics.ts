import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const LOCK_KEY = 'radiance.biometricLock';

export async function isBiometricHardwareAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

export async function authenticateLocal(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  if (enabled) await SecureStore.setItemAsync(LOCK_KEY, '1');
  else await SecureStore.deleteItemAsync(LOCK_KEY);
}

export async function isAppLockEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(LOCK_KEY)) === '1';
}
