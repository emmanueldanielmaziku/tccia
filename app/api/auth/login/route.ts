import { NextResponse } from "next/server";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the received data
    console.log("Login request received:", body);

    // Make request to external API
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: result.message || "Login failed" },
        { status: response.status }
      );
    }

    // Store the token in a secure HTTP-only cookie
    const responseHeaders = new Headers();
    responseHeaders.append(
      "Set-Cookie",
      `token=${result.token}; HttpOnly; Path=/; SameSite=Strict`
    );

    return NextResponse.json(
      {
        message: "Login successful",
        user: result.user,
      },
      {
        headers: responseHeaders,
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
