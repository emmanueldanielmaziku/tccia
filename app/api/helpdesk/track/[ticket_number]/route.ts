import { NextResponse } from "next/server";

const REMOTE_BASE_URL = "https://tccia.kalen.co.tz/api";

export async function GET(
  request: Request,
  context: { params: { ticket_number: string } }
) {
  const params = await context.params;
  const { ticket_number } = params;
  console.log("Tracking ticket:", ticket_number);
  try {
    const res = await fetch(
      `${REMOTE_BASE_URL}/helpdesk/track/${encodeURIComponent(ticket_number)}`,
      {
        method: "GET",
      
      }
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
