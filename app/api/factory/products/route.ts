import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const uid = cookieStore.get("uid");

    if (!token || !uid) {
      return NextResponse.json(
        {
          status: "error",
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { company_tin } = body;

    if (!company_tin) {
      return NextResponse.json(
        {
          status: "error",
          error: "Company TIN is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/factory_verification/products?company_tin=${company_tin}`;
    console.log("Fetching factory products from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });


    // console.log("Response body (Products):", response.body);

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
    console.log("API response:", data);

    if (!data.success) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || "API request failed",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.verifications)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response structure from API",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      verifications: data.verifications,
      pagination: data.pagination,
      message: data.message || "Factory verifications fetched successfully",
    });
  } catch (error) {
    console.error("Factory products fetch error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
