import { NextResponse } from "next/server";

export function proxy(req) {
  const { pathname } = req.nextUrl;

  // Allow static files (images, icons, manifest)
  if (pathname.match(/\.(jpeg|jpg|png|gif|svg|ico|webp|json)$/i)) {
    return NextResponse.next();
  }

  const adminToken = req.cookies.get("sec-admin-token")?.value;

  // List of public paths that don't require authentication
  const isPublicPath = pathname === "/" || pathname.startsWith("/auth");

  // Prevent logged-in users from visiting login/auth pages
  if (isPublicPath && adminToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Protect all other routes
  if (!isPublicPath && !adminToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets with file extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$).*)",
  ],
};
