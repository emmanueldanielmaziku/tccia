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

    // If backend indicates password change required, pass it through as 403
    // Check regardless of HTTP status code - backend might return 200 with need_password_change flag
    if (data?.need_password_change === true || data?.result?.need_password_change === true) {
      const err =
        data?.error ||
        data?.result?.error ||
        data?.message ||
        "Password change required. Please change your password before proceeding.";
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: err,
            need_password_change: true,
            user_role: data?.result?.user_role || data?.user_role,
          },
        },
        { status: 403 }
      );
    }

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
        maxAge: 30 * 60,
      });

      // Store uid
      cookieStore.set("uid", data.result.uid.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 60,
      });

      const r = data.result ?? {};
      return NextResponse.json({
        jsonrpc: "2.0",
        id: null,
        result: {
          token: r.token,
          uid: r.uid,
          modules: r.modules ?? r.user_modules ?? [],
          companies: r.companies ?? r.user_companies ?? [],
          user_type: r.user_type,
          user_role: r.user_role,
          name: r.name,
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
