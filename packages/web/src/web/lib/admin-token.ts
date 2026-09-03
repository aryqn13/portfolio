const KEY = "studio-token";
const EXPIRY_KEY = "studio-token-expiry";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(KEY);
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) ?? 0);
  if (!token) return null;
  if (expiry && expiry < Date.now()) {
    clearAdminToken();
    return null;
  }
  return token;
}

export function setAdminToken(token: string, expiresAt: number) {
  localStorage.setItem(KEY, token);
  localStorage.setItem(EXPIRY_KEY, String(expiresAt));
}

export function clearAdminToken() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(EXPIRY_KEY);
}
