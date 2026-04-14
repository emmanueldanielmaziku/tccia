import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://staff.tncc.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reference_number = body?.reference_number;

    if (!reference_number) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: { error: "reference_number is required" },
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value?.trim();

    const remoteRes = await fetch(
      `${API_BASE_URL}/api/certificate/by_reference`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reference_number }),
      }
    );

    const contentType = remoteRes.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await remoteRes.json()
      : { error: "Invalid response format from upstream" };

    if (!remoteRes.ok) {
      return NextResponse.json(data, { status: remoteRes.status });
    }

    // Upstream already returns the jsonrpc-shaped response.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Certificate by_reference error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: { error: "Internal server error" },
      },
      { status: 500 }
    );
  }
}

