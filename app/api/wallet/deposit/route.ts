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
    const { company_id, amount } = body;

    if (!company_id || !amount) {
      return NextResponse.json(
        { success: false, message: "Company ID and amount are required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/wallet/deposit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id,
        amount: Number(amount),
      }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to initiate wallet deposit." },
      { status: 500 },
    );
  }
}
