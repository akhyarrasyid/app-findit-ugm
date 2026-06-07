import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateCurrentUser } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isValid = await validateCurrentUser(token.value);
  if (!isValid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*"],
};
