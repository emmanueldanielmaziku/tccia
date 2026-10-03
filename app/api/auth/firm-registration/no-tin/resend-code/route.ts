import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://staff.tncc.or.tz";

/**
 * Proxy: resend the OTP for a no-TIN company registration.
 * The backend enforces the maximum of 3 resends and re-dispatches the OTP
 * via email and/or SMS depending on the contact details provided.
 *
 * Upstream: POST /api/company_registration/no_tin/resend_code
 */
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
        { status: 401 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/company_registration/no_tin/resend_code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_reference: body.registration_reference,
        }),
      },
    );

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
        { status: 400 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error resending no-TIN registration code:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          error: "Internal server error",
        },
      },
      { status: 500 },
    );
  }
}
