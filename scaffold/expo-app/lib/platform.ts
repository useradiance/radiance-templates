import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isNative = isIOS || isAndroid;
export const devicePlatform = isIOS ? 'ios' : isAndroid ? 'android' : 'web';
export const isWeb = !isNative;

export const isMobileWebMediaQuery = 'only screen and (max-width: 1300px)';

export const isMobileWeb =
  isWeb &&
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as { window?: Window }).window !== 'undefined' &&
  Boolean((globalThis as { window: Window }).window.matchMedia?.(isMobileWebMediaQuery)?.matches);

export const isIPhoneWeb =
  isWeb && typeof navigator !== 'undefined' && /iPhone/.test(navigator.userAgent);

/**
 * Identity function on web. Returns nothing on other platforms.
 *
 * Note: Platform splitting does not tree-shake away the other platforms,
 * so don't do stuff like e.g. rely on platform-specific imports. Use
 * platform-split files instead.
 */
export function web<T>(value: T): T | undefined {
  if (isWeb) {
    return value;
  }
}

/**
 * Identity function on iOS. Returns nothing on other platforms.
 */
export function ios<T>(value: T): T | undefined {
  if (isIOS) {
    return value;
  }
}

/**
 * Identity function on Android. Returns nothing on other platforms.
 */
export function android<T>(value: T): T | undefined {
  if (isAndroid) {
    return value;
  }
}

/**
 * Identity function on iOS and Android. Returns nothing on web.
 */
export function native<T>(value: T): T | undefined {
  if (isNative) {
    return value;
  }
}

/** Alias for `Platform.select`. */
export const platform = Platform.select;
