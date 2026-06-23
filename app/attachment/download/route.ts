import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new NextResponse("Failed to fetch attachment", { status: res.status });
    }
    const blob = await res.blob();
    const contentType = res.headers.get("Content-Type") || "application/octet-stream";

    const sourceUrl = new URL(url);
    const filename = sourceUrl.pathname.split("/").pop() || "attachment";
    const safeFilename = (
      filename.replace(/[^\w.-]/g, "_").replace(/^_+/, "") || "attachment"
    ) + (/\.[a-z0-9]+$/i.test(filename) ? "" : ".pdf");

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"`,
      },
    });
  } catch {
    return new NextResponse("Failed to download attachment", { status: 500 });
  }
}
