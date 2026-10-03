import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://staff.tncc.or.tz";

/**
 * Proxy: register a company WITHOUT a TIN.
 * Forwards the validated no-TIN payload to the backend, which creates a
 * pending registration and dispatches the OTP via email and/or SMS.
 *
 * Upstream: POST /api/company_registration/no_tin/register
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
      `${API_BASE_URL}/api/company_registration/no_tin/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: body.company_name,
          company_email: body.company_email,
          company_phone: body.company_phone,
          physical_address: body.physical_address,
          company_nationality_code: body.company_nationality_code,
          company_registration_type_code:
            body.company_registration_type_code,
          fax_number: body.fax_number,
          postal_code: body.postal_code,
          postal_address: body.postal_address,
          postal_detail: body.postal_detail,
          description: body.description,
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
    console.error("Error registering no-TIN company:", error);
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
