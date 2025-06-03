import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the received data
    console.log("Registration request received:", body);

    // Format the data for the external API
    const apiData = {
      manager_name: `${body.firstName} ${body.lastName}`,
      phone: body.phone,
      email: body.email,
      password: body.password,
      role: body.role,
    };

    // Make request to external API
    const response = await fetch(`${API_BASE_URL}/api/manager_registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiData),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: result.message || "Registration failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      message: "Registration successful",
      user: {
        email: body.email,
        role: body.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 }
    );
  }
}
