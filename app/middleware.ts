import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isMobileUserAgent(userAgent: string) {
  // Updated regex for broader mobile detection (2025)
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone|Kindle|Silk|Opera Mobi|SamsungBrowser|Fennec|MeeGo|Nokia|HTC|LG|MOT|SonyEricsson|PlayBook|Xperia|Tablet|Touch|Pixel|OnePlus|Redmi|Miui|Huawei|Realme|Oppo|Vivo|Infinix|Tecno|Itel|Googlebot-Mobile/i.test(userAgent);
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const pathname = request.nextUrl.pathname;

  const isMobile = isMobileUserAgent(userAgent);
  const isMobileInfoPage = pathname === "/mobile-info";

  if (isMobile) {
    if (!isMobileInfoPage) {
      // Block all pages for mobile devices except /mobile-info
      return new NextResponse(
        "Mobile access is not allowed. Please use a desktop browser.",
        { status: 403, headers: { "Content-Type": "text/plain" } }
      );
    }
    // Allow /mobile-info for mobile
    return NextResponse.next();
  }

  // Always redirect root to /auth for non-mobile
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}
