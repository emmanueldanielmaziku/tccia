import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { application_id } = body;

    if (!application_id) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            error: "Application ID is required",
          },
        },
        { status: 400 }
      );
    }

    // TODO: Replace with actual API call to your backend
    // This is a mock response
    const mockResponse = {
      jsonrpc: "2.0",
      id: null,
      result: {
        success: true,
        message: "Verification code sent successfully",
      },
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error in send_code:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        result: {
          success: false,
          error: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
