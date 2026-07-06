export type JwtPayload = {
  exp?: number;
  iat?: number;
  role?: string;
  permissions?: unknown[];
  [key: string]: unknown;
};

function decodeBase64Url(segment: string): string | null {
  try {
    if (typeof Buffer !== "undefined") {
      const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
      return Buffer.from(padded, "base64").toString("utf8");
    }

    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return atob(padded);
  } catch {
    return null;
  }
}

export function decodeJwtPayload<T extends JwtPayload = JwtPayload>(token: string): T | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  const decoded = decodeBase64Url(parts[1]);
  if (!decoded) {
    return null;
  }

  try {
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload<{ exp?: number }>(token);
  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}
