import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ location_id: string }> }
) {
  try {
    const { location_id } = await params;
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

    const apiUrl = `${API_BASE_URL}/api/locations/specific/${location_id}`;
    console.log("Fetching specific locations from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Specific locations API response not ok:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch specific locations",
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data?.success) {
      return NextResponse.json({
        success: true,
        location_of_incidence: data.location_of_incidence,
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
    console.error("Error fetching specific locations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

