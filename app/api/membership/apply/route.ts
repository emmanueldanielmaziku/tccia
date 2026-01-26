import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            message: "Unauthorized - Missing authentication token.",
          },
        },
        { status: 401 }
      );
    }
    const body = await request.json();
    
    // Print request body for debugging/Postman testing
    console.log("=== MEMBERSHIP APPLICATION REQUEST BODY (API Route) ===");
    console.log("JSON:", JSON.stringify(body, null, 2));
    console.log("Pretty formatted:", body);
    console.log("=== END REQUEST BODY ===");
    
    const tokenValue = token.value.trim();
    console.log("=== AUTH TOKEN ===");
    console.log("Token exists:", !!tokenValue);
    console.log("Token length:", tokenValue.length);
    console.log("Token preview:", tokenValue.substring(0, 20) + "...");
    console.log("=== END TOKEN ===");
    
    const res = await fetch(`${API_BASE_URL}/api/membership/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenValue}`,
      },
      body: JSON.stringify(body),
    });
    
    console.log("=== API RESPONSE ===");
    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    
    // Check if response is OK before parsing JSON
    if (!res.ok) {
      let errorData;
      try {
        const errorText = await res.text();
        console.log("Error response body (text):", errorText);
        try {
          errorData = JSON.parse(errorText);
          console.log("Error response body (parsed):", errorData);
        } catch {
          errorData = { error: errorText };
        }
      } catch (e) {
        errorData = { error: "Failed to read error response" };
      }
      
      console.error("API request failed:", {
        status: res.status,
        statusText: res.statusText,
        errorData,
      });
      
      // Handle 403 Forbidden - likely authentication issue
      if (res.status === 403) {
        return NextResponse.json(
          {
            jsonrpc: "2.0",
            id: null,
            result: {
              success: false,
              message: "Access forbidden. Your authentication token may be invalid or expired.",
              error: errorData,
            },
          },
          { status: 403 }
        );
      }
      
      // Handle other HTTP errors
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            message: errorData.error || errorData.message || `API request failed: ${res.status} ${res.statusText}`,
            error: errorData,
          },
        },
        { status: res.status }
      );
    }
    
    // Parse JSON only if response is OK
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await res.text();
      console.error("Non-JSON response from API:", rawText);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            message: "Invalid response format from API",
            error: rawText,
          },
        },
        { status: 500 }
      );
    }
    
    const data = await res.json();
    console.log("API response data:", data);
    console.log("=== END API RESPONSE ===");
    
    // Handle JSON-RPC error responses
    if (data.jsonrpc && data.error) {
      // Extract error message from JSON-RPC error structure
      const errorMessage = 
        data.error.message || 
        data.error.data?.message || 
        data.error.data?.name || 
        "Server error occurred while processing your request.";
      
      // Log detailed error for debugging
      console.error("JSON-RPC Error:", {
        code: data.error.code,
        message: errorMessage,
        errorData: data.error.data,
      });
      
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            message: errorMessage,
            error: data.error,
          },
        },
        { status: data.error.code && data.error.code !== 200 ? data.error.code : 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          success: false,
          message: "Error submitting membership application.",
          error: error instanceof Error ? error.message : error,
        },
      },
      { status: 500 }
    );
  }
}
