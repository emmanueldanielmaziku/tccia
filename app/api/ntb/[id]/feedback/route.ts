import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing report identifier",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { rating, additional_comment } = await request.json();

    if (!rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating is required",
        },
        { status: 400 }
      );
    }

    const payload: Record<string, any> = {
      rating: String(rating),
    };

    if (additional_comment) {
      payload.additional_comment = additional_comment;
    }

    console.log("[NTB Feedback] Outgoing payload:", payload);

    const response = await fetch(
      `${API_BASE_URL}/api/ntb/${encodeURIComponent(id)}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value.trim()}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const rawText = await response.text();
    console.log("[NTB Feedback] Raw response:", rawText);

    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.warn("[NTB Feedback] Failed to parse JSON response, returning raw text");
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || "Failed to submit feedback",
          details: data ?? rawText,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        data?.message ||
        (typeof rawText === "string" && rawText.length > 0
          ? rawText
          : "Feedback updated successfully"),
      data: data?.data ?? data ?? rawText,
    });
  } catch (error) {
    console.error("[NTB Feedback] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
