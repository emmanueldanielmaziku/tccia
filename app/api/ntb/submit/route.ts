import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { reporter_name, reporter_contact, subject, description, location } =
      body;

    if (
      !reporter_name ||
      !reporter_contact ||
      !subject ||
      !description ||
      !location
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Prepare the payload for the external API
    const payload = {
      reporter_name,
      reporter_contact,
      subject,
      description,
      location,
    };

    // Make request to external API
    const response = await fetch(
      "https://tccia.kalen.co.tz/api/ntb/report/web",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        { error: "Failed to submit report to external service" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Handle JSON-RPC response structure
    if (result.jsonrpc && result.result) {
      if (result.result.status === "success") {
        return NextResponse.json({
          success: true,
          data: result.result.data,
          message: result.result.message,
        });
      } else {
        return NextResponse.json(
          { error: result.result.message || "Failed to submit report" },
          { status: 400 }
        );
      }
    }

    // Fallback for non-JSON-RPC responses
    return NextResponse.json({
      success: true,
      data: result,
      message: "NTB report submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting NTB report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
