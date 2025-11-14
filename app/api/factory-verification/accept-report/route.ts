import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { factory_verification_id, company_tin } = body;

    if (!factory_verification_id || !company_tin) {
      return NextResponse.json(
        {
          status: "error",
          error: "factory_verification_id and company_tin are required",
        },
        { status: 400 }
      );
    }

    const payload = {
      factory_verification_id,
      company_tin,
    };

    console.log("Accepting factory verification report:", payload);

    const apiUrl = `${API_BASE_URL}/api/factory_verification/accept_report`;
    
    // Create form data instead of JSON
    const formData = new FormData();
    formData.append('factory_verification_id', factory_verification_id.toString());
    formData.append('company_tin', company_tin);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: formData,
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", errorText);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to accept report",
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Accept report result:", result);

    return NextResponse.json({
      status: "success",
      data: result,
      message: "Report accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting report:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
