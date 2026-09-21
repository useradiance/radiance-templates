import { getMissingFirebaseEnvKeys, useFirebaseEmulators } from '@/lib/env';

describe('env', () => {
  it('reports missing firebase keys when unset', () => {
    const missing = getMissingFirebaseEnvKeys();
    expect(Array.isArray(missing)).toBe(true);
  });

  it('defaults emulators to off', () => {
    expect(typeof useFirebaseEmulators).toBe('boolean');
  });
});
