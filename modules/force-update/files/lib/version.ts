import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { appStorage } from '@/lib/mmkv';
import { isNative, isWeb } from '@/lib/platform';

const UPDATE_ACK_KEY = 'radiance.forceUpdate.ack';

/** Semver-ish compare: returns negative if a < b, 0 if equal, positive if a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = a
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map((p) => parseInt(p, 10) || 0);
  const pb = b
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map((p) => parseInt(p, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function getInstalledVersion(): string {
  return (
    Application.nativeApplicationVersion ||
    Constants.expoConfig?.version ||
    Constants.nativeAppVersion ||
    '0.0.0'
  );
}

function androidPackageName(): string | undefined {
  return Application.applicationId || Constants.expoConfig?.android?.package || undefined;
}

/**
 * App Store / Play / web download URL for the force-update CTA.
 * Falls back to a Play Store listing derived from the Android package when no env is set.
 */
export function resolveUpdateUrl(override?: string): string | undefined {
  const trimmed = override?.trim();
  if (trimmed) return trimmed;

  if (Platform.OS === 'ios') {
    const value = process.env.EXPO_PUBLIC_IOS_STORE_URL?.trim();
    return value || undefined;
  }

  if (Platform.OS === 'android') {
    const configured = process.env.EXPO_PUBLIC_ANDROID_STORE_URL?.trim();
    if (configured) return configured;
    const pkg = androidPackageName();
    return pkg ? `https://play.google.com/store/apps/details?id=${pkg}` : undefined;
  }

  const web = process.env.EXPO_PUBLIC_WEB_UPDATE_URL?.trim();
  return web || undefined;
}

function webStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** True in Metro / debug development builds — never treat as a production store visit. */
export function shouldSimulateForceUpdate(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__ && isNative;
}

/**
 * Persisted ack that the user completed (or simulated) an update for `minVersion`.
 * Web uses localStorage; native debug simulation uses MMKV.
 */
export function readUpdateAck(): string | null {
  if (isWeb) return webStorage()?.getItem(UPDATE_ACK_KEY) ?? null;
  try {
    return appStorage.getString(UPDATE_ACK_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeUpdateAck(minVersion: string): void {
  if (isWeb) {
    webStorage()?.setItem(UPDATE_ACK_KEY, minVersion);
    return;
  }
  appStorage.set(UPDATE_ACK_KEY, minVersion);
}

/** @deprecated Prefer writeUpdateAck — kept for call sites that only meant web. */
export function writeWebUpdateAck(minVersion: string): void {
  if (!isWeb) return;
  writeUpdateAck(minVersion);
}

export function isBelowMinVersion(installed: string, minVersion: string): boolean {
  if (compareVersions(installed, minVersion) >= 0) return false;
  const ack = readUpdateAck();
  return !(ack && compareVersions(ack, minVersion) >= 0);
}
