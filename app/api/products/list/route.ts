import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleAuthenticationError } from "../../utils/authErrorHandler";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hse = searchParams.get("hse");
    if (hse) {
      // If searching by hse, use GET with query param
      const apiUrl = `${API_BASE_URL}/api/products/master?hse=${encodeURIComponent(
        hse
      )}`;
      console.log("[ProductMaster] Outgoing GET:", apiUrl);
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          // Explicitly avoid sending Content-Type header for GET requests
          // The external API rejects GET requests with Content-Type headers
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(
          {
            status: "error",
            error: data.error || "API request failed",
            details: data,
          },
          { status: response.status }
        );
      }
      // Assume data.result.products or data.products
      const products = data.result?.products || data.products || [];
      const transformedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        hs_code: typeof product.hse === "string" ? product.hse : "",
        product_category: product.product_category,
        unity_of_measure: typeof product.uom === "string" ? product.uom : "",
      }));
      return NextResponse.json({
        status: "success",
        data: { products: transformedProducts },
        message: "Products fetched successfully",
      });
    }
    // Default: POST with company_id (existing logic)
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
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error(
        "API response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorData);

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
