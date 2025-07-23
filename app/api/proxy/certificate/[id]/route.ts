import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const REMOTE_BASE_URL = "https://tccia.kalen.co.tz/api";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    const remoteRes = await fetch(
      `${REMOTE_BASE_URL}/membership/certificate/${params.id}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    if (!remoteRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch certificate" },
        { status: remoteRes.status }
      );
    }

    const arrayBuffer = await remoteRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: remoteRes.status,
      headers: {
        "Content-Type":
          remoteRes.headers.get("Content-Type") || "application/pdf",
        "Content-Disposition":
          remoteRes.headers.get("Content-Disposition") ||
          `attachment; filename=certificate-${params.id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Proxy certificate fetch error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
