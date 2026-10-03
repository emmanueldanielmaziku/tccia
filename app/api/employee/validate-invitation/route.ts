import { NextResponse } from "next/server";

const API_BASE_URL = "https://staff.tncc.or.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { valid: false, error: "Invitation token is required" },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `${API_BASE_URL}/api/employee/validate-invitation`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: body.token }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      const errMsg =
        data?.result?.error || data?.error || data?.message || "Invalid invitation token";
      return NextResponse.json(
        { valid: false, error: errMsg },
        { status: upstream.status }
      );
    }

    return NextResponse.json({
      valid: data?.result?.valid ?? data?.valid ?? false,
      name: data?.result?.name || data?.name || "",
      email: data?.result?.email || data?.email || "",
      company_name: data?.result?.company_name || data?.company_name || "",
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Unable to reach server. Please try again later." },
      { status: 500 }
    );
  }
}
