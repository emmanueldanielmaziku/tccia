import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/membership/sectors`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sectors.",
        data: null,
      },
      { status: 500 }
    );
  }
}
