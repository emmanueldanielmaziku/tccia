import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiData = {
      name: `${body.firstName} ${body.lastName}`,
      phone: body.phone,
      email: body.email,
      password: body.password,
      role: body.role,
    };

    const response = await fetch(`${API_BASE_URL}/api/registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    const result = await response.json();

    if (result.result?.error) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: result.result.error,
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
        registration_id: result.result.registration_id,
        user_id: result.result.user_id,
        name: result.result.name,
        role: result.result.role,
        email: result.result.email,
        state: result.result.state,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
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
