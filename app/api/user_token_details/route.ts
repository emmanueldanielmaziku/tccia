import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Invalid token", status: 401 },
      { status: 401 },
    );
  }

  try {
    const upstream = await fetch(
      `${API_BASE_URL}/api/user_token_details?token=${encodeURIComponent(token)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
        },
      },
    );

    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch user details",
          status: upstream.status,
        },
        { status: upstream.status },
      );
    }
  } catch (error) {
    console.error("Error fetching user token details:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", status: 500 },
      { status: 500 },
    );
  }
}
