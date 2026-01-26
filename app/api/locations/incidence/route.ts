import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/locations/incidence`;
    console.log("Fetching NTB incidence locations from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Locations API response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch incidence locations",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data?.success) {
      return NextResponse.json({
        success: true,
        data: data.data || [],
        count: data.count ?? (Array.isArray(data.data) ? data.data.length : 0),
      });
    }

    return NextResponse.json({
      success: true,
      data: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0,
    });
  } catch (error) {
    console.error("Error fetching incidence locations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}


