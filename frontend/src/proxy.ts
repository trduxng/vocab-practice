import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const publicRoutes = ["/", "/login", "/register"];

const adminRoutes = ["/admin"];

const creatorRoutes = ["/creator"];

const protectedRoutes = ["/user", "/admin", "/creator"];

type SessionPayload = {
  role?: string;
  permissions?: string[];
  exp?: number;
};

function decodeBase64Url<T>(segment: string): T | null {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function verifySessionToken(token: string): SessionPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }

  const rawToken = (() => {
    try {
      return decodeURIComponent(token);
    } catch {
      return token;
    }
  })();

  const parts = rawToken.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const header = decodeBase64Url<{ alg?: string }>(parts[0]);
  const payload = decodeBase64Url<SessionPayload>(parts[1]);
  if (!header || !payload || header.alg !== "HS256") {
    return null;
  }

  const expected = createHmac("sha256", secret).update(`${parts[0]}.${parts[1]}`).digest();
  const actual = Buffer.from(parts[2].replace(/-/g, "+").replace(/_/g, "/"), "base64");

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return payload;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const session = token ? verifySessionToken(token) : null;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!session) {
      return redirectToLogin(request);
    }
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (session?.role !== "Admin") {
      return NextResponse.redirect(new URL(session?.role === "ContentCreator" ? "/creator/dashboard" : "/user/dashboard", request.url));
    }
  }

  if (creatorRoutes.some((route) => pathname.startsWith(route))) {
    if (session?.role === "Admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (session?.role !== "ContentCreator") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/user") && session?.role === "Admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
