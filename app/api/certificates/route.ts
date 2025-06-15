import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "http://159.65.191.145:8050";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    const response = await fetch(
      `${API_BASE_URL}/api/lpco_application/certificate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token.value}` }),
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result?.error || "Failed to fetch certificates",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Certificate fetch error:", error);
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
