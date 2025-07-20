import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            message: "Unauthorized - Missing authentication token.",
          },
        },
        { status: 401 }
      );
    }
    const body = await request.json();
    const res = await fetch(`${API_BASE_URL}/api/membership/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    // console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          success: false,
          message: "Error submitting membership application.",
          error: error instanceof Error ? error.message : error,
        },
      },
      { status: 500 }
    );
  }
}
