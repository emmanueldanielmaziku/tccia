import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { application_id, code_input } = body;

    if (!application_id || !code_input) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            success: false,
            error: "Application ID and verification code are required",
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
        message: "Verification code verified successfully",
        data: {
          membership_id: "MEM123456",
          status: "active",
          expiry_date: "2025-12-31",
        },
      },
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error("Error in verify_code:", error);
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
