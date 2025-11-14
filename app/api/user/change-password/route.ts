import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://dev.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "Unauthorized - No token provided",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.old_password || !body.new_password || !body.confirm_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "old_password, new_password, and confirm_password are required",
          },
        },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (body.new_password !== body.confirm_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "New passwords do not match",
          },
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: body.old_password,
        new_password: body.new_password,
        confirm_password: body.confirm_password,
      }),
    });

    const data = await response.json();
    console.log("Change password result:", data);

    if (data.result?.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: data.result.error,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        success: true,
        message: data.result?.message || "Password changed successfully",
      },
    });
  } catch (error) {
    console.error("Change password error:", error);
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
