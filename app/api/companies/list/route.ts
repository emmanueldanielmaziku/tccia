import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleAuthenticationError } from "../../utils/authErrorHandler";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const uid = cookieStore.get("uid");

    if (!token || !uid) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Unauthorized - Missing authentication",
          },
        },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/companies`;
    console.log("API URL being called:", apiUrl);
    console.log("Token being sent:", token.value);
    console.log("User ID:", uid.value);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error("Non-JSON response from upstream:", rawText);
      return NextResponse.json(
        {
          status: "error",
          error: {
            code: "INVALID_RESPONSE",
            message: "Upstream server did not return JSON",
            error_details: rawText,
          },
          message: "Invalid response from server",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("Data received:", data);

    if (!response.ok) {
      // Handle authentication errors
      await handleAuthenticationError(response, data);
      
      return NextResponse.json(
        {
          status: "error",
          error: data.error || {
            code: "API_ERROR",
            message: data.message || "Failed to fetch companies",
          },
          message: data.message || "Failed to fetch companies",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      status: data.status || "success",
      data: data.data,
      message: data.message,
    });
  } catch (error) {
    console.error("Company list fetch error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          error: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
