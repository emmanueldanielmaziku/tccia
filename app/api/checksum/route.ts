import { NextResponse } from "next/server";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceNumber = searchParams.get('invoice_number');

    if (!invoiceNumber) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invoice number is required",
        },
        { status: 400 }
      );
    }

    console.log("Fetching checksum for invoice:", invoiceNumber);

    const response = await fetch(`${API_BASE_URL}/api/checksum?invoice_number=${encodeURIComponent(invoiceNumber)}`, {
      method: "GET",
      headers: {
        "Authorization": "Basic dGNjaWE6dGNjaWFAMjAyNQ==",
        "Cookie": "session_id=884fa8a03e5c81074967c52671f6d8e81de92336",
      },
    });

    console.log("Checksum API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Checksum API error:", errorText);
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to fetch checksum",
        },
        { status: response.status }
      );
    }

    // Get the response text first to see what we're actually receiving
    const responseText = await response.text();
    console.log("Raw response from checksum API:", responseText);

    let result;
    try {
      // Try to parse as JSON first
      result = JSON.parse(responseText);
      console.log("Parsed checksum result:", result);
    } catch (parseError) {
      // If JSON parsing fails, check if it's a plain text checksum
      console.log("Not JSON, checking if it's a plain text checksum");
      
      // Check if the response looks like a checksum (alphanumeric string)
      const checksumPattern = /^[a-f0-9]{40}$/i; // 40 character hex string (SHA-1)
      if (checksumPattern.test(responseText.trim())) {
        console.log("Response appears to be a plain text checksum");
        result = {
          checksum: responseText.trim()
        };
      } else {
        console.error("Response is neither JSON nor a valid checksum format");
        console.error("Response was:", responseText);
        return NextResponse.json(
          {
            status: "error",
            error: "Invalid response format from checksum API",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      status: "success",
      data: result,
      message: "Checksum fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching checksum:", error);
    return NextResponse.json(
      {
        status: "error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
