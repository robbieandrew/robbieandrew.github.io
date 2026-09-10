/**
 * Returns the base prefix for assets and routes depending on whether
 * the app is served from the repository root (e.g., localhost) or
 * a GitHub Pages subpath (/robbieandrew.github.io/).
 */
export function getBasePrefix() {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/robbieandrew.github.io')) {
    return '/robbieandrew.github.io/';
  }
  return '/';
}

/**
 * Normalizes an asset or route URL relative to domain/base path.
 * Supports root domain (/), GitHub Pages (/robbieandrew.github.io/), and external URLs.
 */
export function getAssetUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = getBasePrefix();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${base}${cleanPath}`;
}
