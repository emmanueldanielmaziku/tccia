import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.toString();
    const apiUrl =
      "https://dev.kalen.co.tz/api/manufacturers" +
      (query ? `?${query}` : "");

    console.log("[API] /api/manufacturers GET");
    console.log("Incoming search params:", query);
    console.log("Outgoing external API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
    });

    // Debug: Log response status
    console.log("External API response status:", response.status);

    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON from external API:", jsonErr);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse JSON from external API",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      // Debug: Log error details
      console.error("External API error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to fetch manufacturers",
          message: data.message || "Failed to fetch manufacturers",
        },
        { status: response.status }
      );
    }

    // Debug: Log success
    console.log(
      "Manufacturers fetched successfully. Count:",
      Array.isArray(data.data) ? data.data.length : 0
    );

    return NextResponse.json({
      success: true,
      data: data.data || [],
      pagination: data.pagination,
      message: data.message || "Manufacturers fetched successfully",
    });
  } catch (error) {
    // Debug: Log unexpected error
    console.error("Internal server error in /api/manufacturers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
