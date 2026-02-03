import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

const STATIC_PERMISSIONS = [
  { id: 1, name: "Can View", code: "can_view" },
  { id: 2, name: "Can Add", code: "can_add" },
];

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Invalid token", status: 401 },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/permissions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    }
  } catch {
    // fall through to static
  }

  return NextResponse.json(
    { success: true, permissions: STATIC_PERMISSIONS, status: 200 },
    { status: 200 }
  );
}


