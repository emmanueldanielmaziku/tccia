import { NextResponse } from "next/server";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.token || !body.new_password || !body.confirm_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Token, new_password, and confirm_password are required",
          },
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Passwords do not match",
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: body.token,
        new_password: body.new_password,
        confirm_password: body.confirm_password,
      }),
    });

    const data = await response.json();
    console.log("Password reset result:", data);

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
        message: data.result?.message || "Password reset successfully",
      },
    });
  } catch (error) {
    console.error("Password reset error:", error);
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
