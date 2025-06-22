import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tracking_code = searchParams.get("tracking_code");

    if (!tracking_code) {
      return NextResponse.json(
        { error: "Tracking code is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://tccia.kalen.co.tz/api/ntb/report/web/feedback?tracking_code=${encodeURIComponent(
        tracking_code
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "No report found with that tracking code" },
          { status: 404 }
        );
      }

      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch report feedback from external service" },
        { status: response.status }
      );
    }

    const result = await response.json();

    if (result.status === "success" && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Report feedback fetched successfully",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid response from external service" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching NTB report feedback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
