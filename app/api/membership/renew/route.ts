import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const REMOTE_BASE_URL = "https://tcpdev.kalen.co.tz/api";

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

    let data = null;
    try {
      data = await remoteRes.json();
    } catch (e) {
      // If remote did not return JSON, treat as error
      return NextResponse.json(
        { error: "Invalid response from remote server" },
        { status: 502 }
      );
    }
    console.log("Sent body:", body);
    console.log("Renew response:", data);

    // Always return { result: data } so frontend can check result.success
    return NextResponse.json({ result: data.result }, { status: remoteRes.status });
  } catch (error) {
    console.error("Renew API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
