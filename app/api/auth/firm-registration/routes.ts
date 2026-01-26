import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Unauthorized - No token provided",
          },
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/company_registration/submit_tin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    if (data.result.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result.error,
          },
        },
        { status: 401 }
      );
    }

    if (data.result.success) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: true,
            data: data.result.data,
            id: data.result.id,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          error: "Unexpected response format",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Fetching error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          error: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
