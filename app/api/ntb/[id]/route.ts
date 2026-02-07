import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          status: "error",
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          status: "error",
          error: "NTB ID is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/ntb/${encodeURIComponent(id)}`;
    console.log("Fetching NTB details from:", apiUrl);
    console.log("NTB ID:", id);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

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
    console.log("NTB Details API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      if (data.result.status === "success" || data.result.success) {
        return NextResponse.json({
          success: true,
          status: "success",
          data: data.result.data || {},
          message: data.result.message || "NTB details fetched successfully",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            status: "error",
            error: data.result.message || "Failed to fetch NTB details",
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
        data: data.data || data.result || {},
        message: data.message || "NTB details fetched successfully",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      status: "success",
      data: data || {},
      message: "NTB details fetched successfully",
    });

  } catch (error) {
    console.error("NTB details fetch error:", error);
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