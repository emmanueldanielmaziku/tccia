import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/user_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.result?.error) {
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

    if (data.result?.token) {
      const cookieStore = await cookies();
      cookieStore.set("token", data.result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          token: data.result.token,
          uid: data.result.uid,
        },
      });
    }

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          error: "Invalid response from server",
        },
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Login error:", error);
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
