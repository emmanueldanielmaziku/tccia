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

  // Always redirect root to /auth
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const isMobile = isMobileUserAgent(userAgent);
  const isMobileInfoPage = pathname === "/mobile-info";

  if (isMobile) {
    if (!isMobileInfoPage) {
      // Block all other pages for mobile devices
      return new NextResponse(
        "Mobile access is not allowed. Please use a desktop browser.",
        { status: 403, headers: { "Content-Type": "text/plain" } }
      );
    }
    // Allow /mobile-info for mobile
    return NextResponse.next();
  }

  // Allow all for non-mobile
  return NextResponse.next();
}
