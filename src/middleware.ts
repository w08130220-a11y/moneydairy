import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  const publicPaths = ["/login", "/register", "/api/register", "/api/auth"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isAuthed && !isPublic) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthed && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
