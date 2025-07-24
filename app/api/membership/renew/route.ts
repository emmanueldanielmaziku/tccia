import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const REMOTE_BASE_URL = "https://tccia.kalen.co.tz/api";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";
    const body = await req.json();

    // Forward the renew request to the remote API
    const remoteRes = await fetch(`${REMOTE_BASE_URL}/membership/renew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await remoteRes.json();
         console.log("Sent body:", body);

         console.log("Renew response:", data);
    if (!remoteRes.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to renew membership" },
        { status: remoteRes.status }
      );
    }

    return NextResponse.json({ result: data });
  } catch (error) {
    console.error("Renew API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
