import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET(request: Request) {
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

    const apiUrl = `${API_BASE_URL}/api/products/master`;
    console.log("Fetching products from:", apiUrl);
    console.log("Token:", token.value);
    console.log("UID:", uid.value);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        company_id: uid.value,
      }),
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
    console.log("API response:", data);

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

    const transformedProducts = data.result.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      hs_code: typeof product.hse === "string" ? product.hse : "",
      product_category: product.product_category,
      unity_of_measure: typeof product.uom === "string" ? product.uom : "",
    }));

    return NextResponse.json({
      status: "success",
      data: {
        products: transformedProducts,
      },
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
