import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

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
      `${API_BASE_URL}/api/company_registration/fetch_tin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_tin: body.company_tin,
        }),
      }
    );

    const data = await response.json();
    // console.log(data);

    if (data.result?.status === "error" && data.result?.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error: data.result.error,
          },
        },
        { status: 400 }
      );
    }

    if (data.result?.error && !data.result?.status) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error: data.result.error,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error submitting TIN:", error);
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
