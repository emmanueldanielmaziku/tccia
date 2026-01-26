import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();
    const { rating, additional_comment } = body;

    if (!rating) {
      return NextResponse.json(
        {
          success: false,
          message: "Rating is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/business_complain/${id}/feedback`;
    console.log("Submitting feedback to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: JSON.stringify({
        rating: String(rating),
        additional_comment: additional_comment || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Feedback API response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorText);

      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Failed to submit feedback",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data?.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Feedback updated successfully",
        data: data.data,
        status: data.status || 200,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback updated successfully",
      data: data,
      status: 200,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}



