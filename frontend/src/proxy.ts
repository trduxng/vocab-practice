// vocab-practice/frontend/src/proxy.ts (Next.js middleware - proxy convention)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register"];

const adminRoutes = ["/admin"];

const creatorRoutes = ["/creator"];

const protectedRoutes = ["/user", "/admin", "/creator"];

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
  const userCookie = request.cookies.get("user")?.value;

  let user: { role?: string } | null = null;
  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (user?.role !== "Admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  if (creatorRoutes.some((route) => pathname.startsWith(route))) {
    if (user?.role !== "ContentCreator" && user?.role !== "Admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/user") && user?.role === "Admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
