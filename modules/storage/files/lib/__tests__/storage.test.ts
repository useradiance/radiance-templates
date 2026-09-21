import { DOWNLOAD_URL_CACHE_TTL_MS, clearDownloadUrlCache } from '@/lib/storage';

describe('storage url cache helpers', () => {
  it('exposes a positive TTL', () => {
    expect(DOWNLOAD_URL_CACHE_TTL_MS).toBeGreaterThan(0);
  });

  it('clears the cache without throwing', () => {
    expect(() => clearDownloadUrlCache()).not.toThrow();
  });
});
