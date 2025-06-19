import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
            status: "error",
            error: "Unauthorized - Missing authentication",
          },
        },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/user/${uid.value}`;
    console.log("API URL being called:", apiUrl);
    console.log("Token being sent:", token.value);
    console.log("User ID:", uid.value);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: JSON.stringify({}),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (response.status === 403) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error: "Access denied - Invalid or expired token",
          },
        },
        { status: 403 }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid response type:", contentType);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error: "Invalid response from server",
          },
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("API Response:", data);
    console.log(uid);

    if (!response.ok) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            status: "error",
            error: data.result?.error || "Failed to fetch user profile",
          },
        },
        { status: response.status }
      );
    }

 
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        status: "success",
        user: {
          id: data.result.id,
          name: data.result.name,
          role: data.result.role,
          phone: data.result.phone,
          state: data.result.state,
        },
      },
    });
  } catch (error) {
    console.error("User profile fetch error:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          status: "error",
          error: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
