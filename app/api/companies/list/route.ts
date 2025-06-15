import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

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

    const response = await fetch(`${API_BASE_URL}/api/companies/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value}`,
      },
      body: JSON.stringify({
        client_id: "UQzFuqCobZOLV22ZWTB4YSXLOd0a",
        client_secrete: "9GxdBjN72Cppbr2FnVJ88WtfKx_MiBD0Mb7fEMB27fka",
        client_type: "client_credentials",
      }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result?.error || "Failed to fetch companies",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Company list fetch error:", error);
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
