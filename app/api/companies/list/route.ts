import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";
// const API_BASE_URL = "http://159.65.191.145:8050";

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

    const apiUrl = `${API_BASE_URL}/api/companies/${uid.value}`;
    console.log("API URL being called:", apiUrl);
    console.log("Token being sent:", token.value);
    console.log("User ID:", uid.value);

    const response = await fetch(apiUrl, {
      method: "POST",
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
            error: data.result?.error || "Failed to fetch companies",
          },
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
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
