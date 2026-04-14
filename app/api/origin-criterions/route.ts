import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://staff.tncc.co.tz";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const apiUrl = `${API_BASE_URL}/api/origin_criterions`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: token?.value
        ? { Authorization: `Bearer ${token.value.trim()}` }
        : undefined,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";
    const raw = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch origin criterions",
          details: raw,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(raw);
  } catch (error) {
    console.error("Origin criterions fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

