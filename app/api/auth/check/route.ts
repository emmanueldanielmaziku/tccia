import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Here you would typically verify the token with your backend
    // For now, we'll just return a success response
    return NextResponse.json({
      authenticated: true,
      user: {
        // Add any user data you want to return
        id: "user_id",
        name: "User Name",
        email: "user@example.com",
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
