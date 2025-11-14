import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const REMOTE_BASE_URL = "https://dev.kalen.co.tz/api";

export async function GET(req: NextRequest, context: any) {
  try {
    const id = context.params?.id;
    console.log("Certificate download requested for ID:", id);
    
    if (!id) {
      console.error("No certificate ID provided");
      return NextResponse.json({ error: "Missing certificate ID" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";
    const uid = cookieStore.get("uid")?.value || "";
    
    console.log("Token available:", !!token);
    console.log("UID:", uid);

    if (!token) {
      console.error("No authentication token found");
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const remoteUrl = `${REMOTE_BASE_URL}/membership/certificate/${id}`;
    console.log("Requesting certificate from:", remoteUrl);

    const remoteRes = await fetch(remoteUrl, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "User-Agent": "TCCIA-Frontend/1.0",
      },
    });

    console.log("Remote response status:", remoteRes.status);
    console.log("Remote response headers:", Object.fromEntries(remoteRes.headers.entries()));

    if (!remoteRes.ok) {
      const errorText = await remoteRes.text();
      console.error("Remote API error:", errorText);
      return NextResponse.json(
        { error: `Certificate fetch failed: ${errorText}` },
        { status: remoteRes.status }
      );
    }

    const arrayBuffer = await remoteRes.arrayBuffer();
    console.log("Certificate data size:", arrayBuffer.byteLength);

    if (arrayBuffer.byteLength === 0) {
      console.error("Empty certificate response");
      return NextResponse.json(
        { error: "Certificate file is empty" },
        { status: 500 }
      );
    }

    const contentType = remoteRes.headers.get("Content-Type") || "application/pdf";
    const contentDisposition = remoteRes.headers.get("Content-Disposition") || 
      `attachment; filename=membership_certificate_${id}.pdf`;

    console.log("Sending certificate with Content-Type:", contentType);

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Content-Length": arrayBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Proxy certificate fetch error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
