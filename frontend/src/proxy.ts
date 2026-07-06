import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register"];

const adminRoutes = ["/admin"];

const creatorRoutes = ["/creator"];

const protectedRoutes = ["/user", "/admin", "/creator"];

type SessionPayload = {
  role?: string;
  permissions?: string[];
  exp?: number;
};

function getSessionFromToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
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
  const session = token ? getSessionFromToken(token) : null;

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
