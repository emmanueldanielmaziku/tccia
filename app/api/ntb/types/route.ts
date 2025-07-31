import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET() {
  try {
    const apiUrl = `${API_BASE_URL}/api/ntb/types`;
    console.log("Fetching NTB types from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      // Removed Content-Type header as it causes 400 error from external API
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "API response not ok:",
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
    console.log("NTB Types API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      if (data.result.status === "success") {
        return NextResponse.json({
          success: true,
          status: "success",
          data: data.result.data || [],
          message: data.result.message || "NTB types fetched successfully",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: data.result.message || "Failed to fetch NTB types",
          },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (data.status === "success" || data.success) {
      return NextResponse.json({
        success: true,
        status: "success",
        data: data.data || data.result || [],
        message: data.message || "NTB types fetched successfully",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      status: "success",
      data: Array.isArray(data) ? data : [],
      message: "NTB types fetched successfully",
    });

  } catch (error) {
    console.error("NTB types fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
} 