// Vite supplies the deployed base, including a repository subdirectory on Pages.
const base = import.meta.env.BASE_URL;
export function sitePath(path: string): string {
  return base + path.replace(/^\/+/, '');
}
export function yearFromPath(pathname: string): '2025' | '2026' {
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return /^\/?2025(?:\/|$)/.test(path) ? '2025' : '2026';
}
