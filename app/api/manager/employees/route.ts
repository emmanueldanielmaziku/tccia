import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value || "";

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Invalid token", status: 401 },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get("company_id");
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    if (!company_id) {
      return NextResponse.json(
        { success: false, error: "company_id is required", status: 400 },
        { status: 400 }
      );
    }

    const upstreamUrl = `${API_BASE_URL}/api/manager/employees?company_id=${encodeURIComponent(
      company_id
    )}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    const contentType = upstream.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await upstream.json()
      : await upstream.text();

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        status: 500,
      },
      { status: 500 }
    );
  }
}


