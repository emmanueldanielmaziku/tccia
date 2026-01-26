import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

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

    const formData = await request.json();
    const { company_tin } = formData;

    if (!company_tin) {
      return NextResponse.json(
        {
          status: "error",
          error: "Company TIN is required",
        },
        { status: 400 }
      );
    }

    const payload = {
      company_tin: company_tin,
      applicant_name: formData.applicant_name,
      applicant_phone: formData.applicant_phone,
      applicant_email: formData.applicant_email,
      suggested_inspection_date: formData.suggested_inspection_date
        ? formData.suggested_inspection_date
        : null,
      products: formData.products.map((product: any) => ({
        manufacturer_id: product.manufacturer_id,
        product_name_id: product.product_name_id,
        description: product.description,
      })),
    };

    console.log("Submitting factory verification:", payload);

    const apiUrl = `${API_BASE_URL}/api/factory_verification`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      
      },
      body: JSON.stringify(payload),
    });
    
    console.log("Body sent to API:", payload);
    console.log("API response status:", response.status);

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

    return NextResponse.json({
      status: "success",
      data: data,
      message: "Factory verification submitted successfully",
    });
  } catch (error) {
    console.error("Factory verification submit error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
