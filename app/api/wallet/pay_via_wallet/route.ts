import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://staff.tncc.or.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { payment_reference, company_id } = body;

    if (!payment_reference) {
      return NextResponse.json(
        { success: false, message: "payment_reference is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/wallet/pay_via_wallet`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        body: JSON.stringify({ payment_reference, company_id }),
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to process wallet payment." },
      { status: 500 },
    );
  }
}
