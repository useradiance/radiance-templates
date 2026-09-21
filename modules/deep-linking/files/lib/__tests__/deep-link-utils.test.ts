import { pathFromUrl } from '@/lib/deep-link-utils';

describe('pathFromUrl', () => {
  it('passes through absolute paths', () => {
    expect(pathFromUrl('/settings')).toBe('/settings');
  });

  it('parses https URLs', () => {
    expect(pathFromUrl('https://app.example.com/profile?x=1')).toBe('/profile?x=1');
  });

  it('parses custom schemes', () => {
    expect(pathFromUrl('myapp://feed')).toBe('/feed');
  });

  it('returns null for empty input', () => {
    expect(pathFromUrl(null)).toBeNull();
    expect(pathFromUrl('')).toBeNull();
  });
});
