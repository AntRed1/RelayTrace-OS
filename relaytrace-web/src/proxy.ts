import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Rutas públicas (sin autenticación requerida) ─────────────────────────────
const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register"];

// ─── Prefijos permitidos por rol ──────────────────────────────────────────────
const ROLE_PREFIXES: Record<string, string[]> = {
  SUPER_ADMIN:   ["/admin", "/dispatcher"],
  COMPANY_ADMIN: ["/admin", "/dispatcher"],
  DISPATCHER:    ["/dispatcher"],
  DRIVER:        ["/driver"],
};

const ROLE_HOME: Record<string, string> = {
  SUPER_ADMIN:   "/admin/dashboard",
  COMPANY_ADMIN: "/admin/dashboard",
  DISPATCHER:    "/dispatcher/dashboard",
  DRIVER:        "/driver/dashboard",
};

// ─── Middleware ───────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("rt_token")?.value;
  const role  = request.cookies.get("rt_role")?.value;

  // 1. Ruta raíz: landing page siempre accesible.
  //    Si el usuario ya está autenticado, redirigirlo a su dashboard.
  if (pathname === "/") {
    if (token && role && ROLE_HOME[role]) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], request.url));
    }
    return NextResponse.next();
  }

  // 2. Otras rutas públicas (login, register)
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 3. Rutas protegidas: requieren token
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 4. Verificar que el rol tenga acceso al prefijo de la ruta
  if (role) {
    const allowed = ROLE_PREFIXES[role] ?? [];
    const hasAccess = allowed.some((prefix) => pathname.startsWith(prefix));
    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? "/auth/login", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Excluir archivos estáticos de Next.js, imágenes del public/ y favicon
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.svg|images|icons|fonts).*)",
  ],
};
