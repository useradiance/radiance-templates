import { android, ios, isAndroid, isIOS, isNative, isWeb, native, web } from '@/lib/platform';

describe('platform helpers', () => {
  it('exposes mutually exclusive web vs native flags', () => {
    expect(isWeb || isNative).toBe(true);
    expect(isWeb && isNative).toBe(false);
  });

  it('identity helpers return the value only on the matching platform', () => {
    if (isWeb) {
      expect(web('x')).toBe('x');
      expect(native('x')).toBeUndefined();
    } else {
      expect(native('x')).toBe('x');
      expect(web('x')).toBeUndefined();
    }

    if (isIOS) {
      expect(ios('x')).toBe('x');
    } else {
      expect(ios('x')).toBeUndefined();
    }

    if (isAndroid) {
      expect(android('x')).toBe('x');
    } else {
      expect(android('x')).toBeUndefined();
    }
  });
});
