import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Missing authentication" },
        { status: 401 }
      );
    }

    // Handle FormData for file uploads
    const formData = await request.formData();

    const externalFormData = new FormData();

    // Forward all form fields to the external API
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        externalFormData.append(key, value);
      } else if (typeof value === "string") {
        externalFormData.append(key, value as string);
      } else if (value !== undefined && value !== null) {
        externalFormData.append(key, String(value));
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/api/ntb/create-with-files`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value.trim()}`,
        },
        body: externalFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        { error: "Failed to submit report to external service" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Handle JSON-RPC response structure
    if (result.jsonrpc && result.result) {
      if (result.result.success) {
        console.log(
          "NTB Success - Report Reference:",
          result.result.data?.report_reference
        );
        return NextResponse.json({
          success: true,
          data: result.result.data,
          message: result.result.message || "NTB report created successfully with attachments",
        });
      } else {
        console.log("NTB Error:", result.result.message);
        return NextResponse.json(
          { error: result.result.message || "Failed to submit report" },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message || "NTB report created successfully with attachments",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      data: result,
      message: "NTB report created successfully with attachments",
    });
  } catch (error) {
    console.error("Error submitting NTB report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

