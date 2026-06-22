// vocab-practice/frontend/src/proxy.ts (Next.js middleware - proxy convention)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route công khai (không cần login)
const publicRoutes = ["/", "/login", "/register"];

// Các route chỉ dành cho admin
const adminRoutes = ["/admin"];

// Các route cần login (cả user và admin)
const protectedRoutes = ["/user", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cho phép public routes và static files
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Lấy token và user từ cookie (thay vì localStorage vì middleware chạy ở server)
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

  // Nếu chưa login mà cố truy cập protected route
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token || !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Nếu không phải admin mà cố truy cập admin route
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (user?.role !== "Admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // Nếu là admin mà vào user route thì redirect về admin dashboard
  if (pathname.startsWith("/user") && user?.role === "Admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
