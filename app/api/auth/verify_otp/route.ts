import { NextResponse } from "next/server";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { login, otp } = body ?? {};

    if (!login || !otp) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: { error: "login and otp are required" },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/verify_otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ login, otp }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error:
              data?.error ||
              data?.message ||
              data?.result?.error ||
              "OTP verification failed",
          },
        },
        { status: response.status }
      );
    }

    if (data?.success === true) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          success: true,
          message: data.message || "Account verified successfully. You can now login.",
        },
      });
    }

    // handle wrapped formats
    if (data?.result?.success === true) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          success: true,
          message: data.result.message || "Account verified successfully. You can now login.",
        },
      });
    }

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: { error: data?.message || "Invalid or expired OTP. Please request a new code." },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
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