import { NextRequest, NextResponse } from "next/server";

const REMOTE_BASE_URL = "https://dev.kalen.co.tz/api";

export async function GET() {
  try {
    const res = await fetch(`${REMOTE_BASE_URL}/helpdesk/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch services" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
