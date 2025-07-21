import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const isMobile = isMobileUserAgent(userAgent);
  const isMobileInfoPage = request.nextUrl.pathname === "/mobile-info";

  if (isMobile && !isMobileInfoPage) {
    return NextResponse.redirect(new URL("/mobile-info", request.url));
  }
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}
