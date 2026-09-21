/**
 * Turns a full URL or relative path into an Expo Router path.
 * Returns null when the input is empty or only the scheme root.
 */
export function pathFromUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path || path === '/') return null;
    return path.startsWith('/') ? path : `/${path}`;
  } catch {
    // Scheme-only custom URLs like myapp://profile
    const withoutScheme = trimmed.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, '');
    if (!withoutScheme) return null;
    return withoutScheme.startsWith('/') ? withoutScheme : `/${withoutScheme}`;
  }
}
