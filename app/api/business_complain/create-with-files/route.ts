import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    // Note: Auth is optional for guest submissions, but we'll try to use token if available
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token.value.trim()}`;
    }

    // Get form data from request
    const formData = await request.formData();

    const apiUrl = `${API_BASE_URL}/api/business_complain/create-with-files`;
    console.log("Submitting business complaint to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Business complaint API response not ok:",
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
          message: errorData.message || "Failed to submit business complaint",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data?.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Business complaint submitted successfully",
        data: data.data,
        status: data.status || 201,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Business complaint submitted successfully",
      data: data,
      status: 201,
    });
  } catch (error) {
    console.error("Error submitting business complaint:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

