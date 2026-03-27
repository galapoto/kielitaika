const RAW_API_URL = ((import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || "").replace(/\/+$/, "");

export const API_URL = RAW_API_URL;

export function resolveApiUrl(path: string): string {
  if (!path) {
    return path;
  }
  if (/^https?:\/\//i.test(path) || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  return `${API_URL}${path}`;
}
