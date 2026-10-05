import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proteksi akses route server-side: jika belum login, langsung lempar ke /login
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Izinkan asset publik, favicon, icon, dan static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("ezy_session_token")?.value;

  // 1. Jika pengguna membuka halaman root '/'
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Jika pengguna belum login dan mencoba membuka halaman aplikasi selain /login
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Jika pengguna sudah login dan membuka /login, arahkan langsung ke dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
