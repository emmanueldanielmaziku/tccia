import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://staff.tncc.or.tz";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Authorization header is required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { payment_reference } = body;

    if (!payment_reference) {
      return NextResponse.json(
        { success: false, message: "payment_reference is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/invoice/details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ payment_reference }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in invoice/details proxy:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch invoice details." },
      { status: 500 },
    );
  }
}
