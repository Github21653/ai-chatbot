import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === "/login";
  const isProtected = pathname.startsWith("/chat") || pathname.startsWith("/admin");

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/chat/:path*", "/admin/:path*"],
};