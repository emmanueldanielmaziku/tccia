import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required email field
    if (!body.email) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Email is required",
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/request-password-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
      }),
    });

    const data = await response.json();
    console.log("Password reset request result:", data);

    if (data.result?.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result.error,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        success: true,
        message: data.result?.message || "Password reset email sent successfully",
      },
    });
  } catch (error) {
    console.error("Password reset request error:", error);
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
