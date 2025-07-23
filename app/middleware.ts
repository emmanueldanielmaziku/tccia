import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isMobileUserAgent(userAgent: string) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    userAgent
  );
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;

  console.log("User-Agent:", userAgent);

  const isMobile = isMobileUserAgent(userAgent);
  const isMobileInfoPage = pathname === "/mobile-info";

  if (isMobile && !isMobileInfoPage) {
    return NextResponse.redirect(new URL("/mobile-info", request.url));
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}
