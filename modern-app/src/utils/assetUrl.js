/**
 * Normalizes an asset or route URL relative to Vite's configured BASE_URL.
 * Supports root domain (/), subpath (/repo-name/), and relative (./) hosting.
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

  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${base}${cleanPath}`;
}
