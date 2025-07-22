import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const REMOTE_BASE_URL = "https://tccia.kalen.co.tz/api";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const remoteRes = await fetch(
    `${REMOTE_BASE_URL}/membership/certificate/${context.params.id}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    }
  );

  const arrayBuffer = await remoteRes.arrayBuffer();
  return new NextResponse(arrayBuffer, {
    status: remoteRes.status,
    headers: {
      "Content-Type":
        remoteRes.headers.get("Content-Type") || "application/pdf",
      "Content-Disposition":
        remoteRes.headers.get("Content-Disposition") ||
        "attachment; filename=certificate.pdf",
    },
  });
}
