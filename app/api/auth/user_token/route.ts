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
    console.log("User token result:", data);

    // If backend indicates OTP verification required, pass it through as 403
    if (
      response.status === 403 ||
      data?.need_otp_verification === true ||
      data?.result?.need_otp_verification === true
    ) {
      const err =
        data?.error ||
        data?.result?.error ||
        data?.message ||
        "Account not verified. Please enter the OTP sent to your phone/email.";
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: err,
            need_otp_verification: true,
          },
        },
        { status: 403 }
      );
    }

    if (data.result?.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result.error,
          },
        },
        { status: response.status || 401 }
      );
    }

    if (data.result?.token) {
      const cookieStore = await cookies();

      // Store token
      cookieStore.set("token", data.result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      // Store uid
      cookieStore.set("uid", data.result.uid.toString(), {
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
          modules: data.result.modules || [],
          companies: data.result.companies || [],
          user_type: data.result.user_type,
          user_role: data.result.user_role,
          name: data.result.name,
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
