import { NextResponse } from "next/server";

const REMOTE_BASE_URL = "https://tcpdev.kalen.co.tz/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_number: string }> }
) {
  const { ticket_number } = await params;
  console.log("Tracking ticket:", ticket_number);

  try {
    const res = await fetch(
      `${REMOTE_BASE_URL}/helpdesk/track/${encodeURIComponent(ticket_number)}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
