import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://staff.tncc.or.tz";

/**
 * Proxy: verify the OTP for a no-TIN company registration.
 * On success the backend completes the registration and creates the company
 * with status = approved and has_tin = false.
 *
 * Upstream: POST /api/company_registration/no_tin/verify_code
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
      `${API_BASE_URL}/api/company_registration/no_tin/verify_code`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_reference: body.registration_reference,
          code_input: body.code_input,
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
    console.error("Error verifying no-TIN registration code:", error);
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
