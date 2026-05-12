import { NextResponse } from "next/server";

const API_BASE_URL = "https://staff.tncc.or.tz";

export async function GET() {
  try {
    const apiUrl = `${API_BASE_URL}/api/business_complain/types`;
    console.log("Fetching business complaint types from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Business complaint types API response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorText);

      return NextResponse.json(
        {
          status: "error",
          error: `API request failed: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error("Non-JSON response from API:", rawText);
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid response format from API",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Business complaint types API response:", data);

    if (data.jsonrpc && data.result) {
      if (data.result.status === "success") {
        return NextResponse.json({
          success: true,
          data: data.result.data || [],
          count: data.result.count ?? (Array.isArray(data.result.data) ? data.result.data.length : 0),
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.result.message || "Failed to fetch business complaint types",
          },
          { status: 400 }
        );
      }
    }

    if (data.success) {
      return NextResponse.json({
        success: true,
        data: data.data || [],
        count: data.count ?? (Array.isArray(data.data) ? data.data.length : 0),
      });
    }

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0,
    });
  } catch (error) {
    console.error("Business complaint types fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
