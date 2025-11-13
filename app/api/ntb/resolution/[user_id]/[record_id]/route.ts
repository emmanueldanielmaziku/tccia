import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string; record_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { user_id, record_id } = await params;

    if (!user_id || !record_id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and Record ID are required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/ntb/resolution/${encodeURIComponent(user_id)}/${encodeURIComponent(record_id)}`;
    console.log("Fetching NTB resolution from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("API response not ok:", response.status, response.statusText);
      console.error("Error response body:", errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.error || `API request failed: ${response.status} ${response.statusText}`,
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
          success: false,
          error: "Invalid response format from API",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("NTB Resolution API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      if (data.result.status === "success" || data.result.success) {
        return NextResponse.json({
          success: true,
          data: data.result.data || {},
          message: data.result.message || "NTB resolution fetched successfully",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.result.message || "Failed to fetch NTB resolution",
          },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (data.status === "success" || data.success) {
      return NextResponse.json({
        success: true,
        data: data.data || data.result || {},
        message: data.message || "NTB resolution fetched successfully",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      data: data || {},
      message: "NTB resolution fetched successfully",
    });

  } catch (error) {
    console.error("NTB resolution fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ user_id: string; record_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { user_id, record_id } = await params;

    if (!user_id || !record_id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and Record ID are required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { resolution_remarks } = body;

    if (!resolution_remarks || !resolution_remarks.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "resolution_remarks is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/ntb/resolution/${encodeURIComponent(user_id)}/${encodeURIComponent(record_id)}`;
    console.log("Submitting NTB resolution to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolution_remarks: resolution_remarks.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("API response not ok:", response.status, response.statusText);
      console.error("Error response body:", errorData);

      // Extract error message from various possible structures
      const errorMessage = 
        errorData.error || 
        errorData.message || 
        errorData.result?.error || 
        errorData.result?.message ||
        (typeof errorData === 'string' ? errorData : null) ||
        `API request failed: ${response.status} ${response.statusText}`;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
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
          success: false,
          error: "Invalid response format from API",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("NTB Resolution submission API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      if (data.result.status === "success" || data.result.success) {
        return NextResponse.json({
          success: true,
          message: data.result.message || "Resolution submitted successfully",
          resolution_id: data.result.resolution_id || data.result.data?.resolution_id,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.result.message || "Failed to submit resolution",
          },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (data.status === "success" || data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Resolution submitted successfully",
        resolution_id: data.resolution_id || data.data?.resolution_id,
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      message: "Resolution submitted successfully",
      resolution_id: data.resolution_id,
    });

  } catch (error) {
    console.error("NTB resolution submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

