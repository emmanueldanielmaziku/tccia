import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("search");

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Please enter at least 2 characters to search",
      });
    }

    const apiUrl = `https://tcpdev.kalen.co.tz/api/manufacturers?search=${encodeURIComponent(query)}`;

    console.log("[API] /api/agents/search GET");
    console.log("Incoming search params:", query);
    console.log("Outgoing external API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
    });

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
      console.error("External API error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to search manufacturers",
          message: data.message || "Failed to search manufacturers",
        },
        { status: response.status }
      );
    }

    // Transform manufacturers data to agents format
    const agents = (data.data || []).map((manufacturer: any) => ({
      tin: manufacturer.company_tin || "",
      name: manufacturer.company_name || "Unknown",
      email: manufacturer.company_email || "",
    }));

    return NextResponse.json({
      success: true,
      data: agents,
      message: `Found ${agents.length} agent(s)`,
    });
  } catch (error) {
    console.error("Internal server error in /api/agents/search:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

