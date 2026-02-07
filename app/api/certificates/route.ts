import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

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
    console.log(data);

    if (!response.ok) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error:
              data.result?.error ||
              data.result?.message ||
              "Failed to fetch certificates",
          },
        },
        { status: response.status }
      );
    }

    // Ensure the response matches the expected structure
    if (data && Array.isArray(data.result?.data)) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          status: data.result.status || "success",
          data: data.result.data,
        },
      });
    } else {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error:
              data.result?.error ||
              data.result?.message ||
              "Unexpected response structure",
          },
        },
        { status: 500 }
      );
    }
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
