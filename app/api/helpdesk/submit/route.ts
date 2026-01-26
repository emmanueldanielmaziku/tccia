import { NextRequest, NextResponse } from "next/server";

const REMOTE_BASE_URL = "https://tcpdev.kalen.co.tz/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${REMOTE_BASE_URL}/helpdesk/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to submit ticket" },
        { status: res.status }
      );
    }
    const data = await res.json();
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
