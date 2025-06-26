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

    const apiUrl = `${API_BASE_URL}/api/factory/products`;
    console.log("Fetching factory products from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: JSON.stringify({
        company_tin: company_tin,
      }),
    });

    console.log("Response status:", response.status);

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
    console.log("API response:", data.result.products);

    if (
      data.result &&
      data.result.error &&
      data.result.error.includes("No factory verification found")
    ) {
      return NextResponse.json({
        status: "success",
        result: {
          products: [],
        },
        message: "No products found for this company",
        empty: true,
      });
    }

    if (!data.result || !data.result.products) {
      console.error("Unexpected API response structure:", data);
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid response structure from API",
        },
        { status: 500 }
      );
    }

    const transformedProducts = data.result.products.map(
      (product: any, index: number) => ({
        sn: index + 1,
        id: product.id,
        product_name: product.product_name,
        hs_code: product.hs_code,
        state: product.state,
        community_name: product.community_name,
        community_short_code: product.community_short_code,
      })
    );

    return NextResponse.json({
      status: "success",
      result: {
        products: transformedProducts,
      },
      message: "Factory products fetched successfully",
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
