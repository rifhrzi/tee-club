import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
export async function middleware(request: NextRequest) {
  const publicPaths = ["/api/auth/login", "/api/auth/register", "/api/auth/refresh"];
  if (publicPaths.includes(request.nextUrl.pathname)) return NextResponse.next();
  const token =
    request.headers.get("authorization")?.split(" ")[1] ||
    request.cookies.get("accessToken")?.value;
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/dashboard"))
      return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const decoded = verifyToken(token, "access") as { userId: string; role: string };
    if (request.nextUrl.pathname.startsWith("/dashboard") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", decoded.role);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      return NextResponse.json({ error: "Token expired", code: "TOKEN_EXPIRED" }, { status: 401 });
    }
    if (request.nextUrl.pathname.startsWith("/dashboard"))
      return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
