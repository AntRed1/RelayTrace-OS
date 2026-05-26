import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];

const ROLE_PREFIXES: Record<string, string[]> = {
  COMPANY_ADMIN: ["/admin", "/dispatcher"],
  SUPER_ADMIN: ["/admin", "/dispatcher"],
  DISPATCHER: ["/dispatcher"],
  DRIVER: ["/driver"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r)))
    return NextResponse.next();

  const token = request.cookies.get("rt_token")?.value;
  const role = request.cookies.get("rt_role")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (role) {
    const allowed = ROLE_PREFIXES[role] ?? [];
    const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));
    if (!hasAccess) {
      const fallbacks: Record<string, string> = {
        COMPANY_ADMIN: "/admin/dashboard",
        SUPER_ADMIN: "/admin/dashboard",
        DISPATCHER: "/dispatcher/dashboard",
        DRIVER: "/driver/dashboard",
      };
      return NextResponse.redirect(
        new URL(fallbacks[role] ?? "/auth/login", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
