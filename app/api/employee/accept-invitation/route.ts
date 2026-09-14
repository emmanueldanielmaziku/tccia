import { NextResponse } from "next/server";

const API_BASE_URL = "https://staff.tncc.or.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { success: false, message: "Invitation token is required" },
        { status: 400 }
      );
    }

    if (!body.new_password || !body.confirm_password) {
      return NextResponse.json(
        { success: false, message: "New password and confirm password are required" },
        { status: 400 }
      );
    }

    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `${API_BASE_URL}/api/employee/accept-invitation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: body.token,
          new_password: body.new_password,
          confirm_password: body.confirm_password,
        }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      const errMsg =
        data?.result?.error || data?.error || data?.message || "Failed to accept invitation";
      return NextResponse.json(
        { success: false, message: errMsg },
        { status: upstream.status }
      );
    }

    return NextResponse.json({
      success: data?.result?.success ?? data?.success ?? true,
      message:
        data?.result?.message ||
        data?.message ||
        "Invitation accepted. You can now login with your new password.",
      email: data?.result?.email || data?.email || "",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to reach server. Please try again later." },
      { status: 500 }
    );
  }
}
