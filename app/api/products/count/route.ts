import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleAuthenticationError } from "../../utils/authErrorHandler";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

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
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      
      // Handle authentication errors
      await handleAuthenticationError(response, errorData);
      
      return NextResponse.json(
        {
          status: "error",
          error: `API request failed: ${response.status} ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

      const data = await response.json();
      console.log("Product count API response:", data);

      // Handle different response structures
      let productCount = 0;
      if (data.product_count !== undefined) {
        productCount = parseInt(data.product_count, 10) || 0;
      } else if (data.success && data.verifications) {
        // If we get verifications structure, count products from all verifications
        productCount = data.verifications.reduce((total: number, verification: any) => {
          return total + (Array.isArray(verification.products) ? verification.products.length : 0);
        }, 0);
      }

    // Return in the expected format
    return NextResponse.json({
      success: true,
      product_count: productCount,
      message:
        data.message ||
        `Total ${productCount} products found for TIN ${company_tin}.`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}