import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, expectedSessionToken } from "@/lib/admin/auth";

// Protect the internal tools: the admin tour tools plus the FUB-connected
// dashboard and weekly developer report (all expose lead PII). The login page
// and login API are public so agents can authenticate; everything else under
// /admin, /api/admin, /dashboard, and /reports requires a valid session cookie.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const authed = !!token && token === expectedSessionToken();
  if (authed) return NextResponse.next();

  // API routes get a 401; pages redirect to login (preserving intended path).
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/reports/:path*",
  ],
};
