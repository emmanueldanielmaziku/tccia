import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const uid = cookieStore.get("uid");

    if (!token || !uid) {
      return NextResponse.json(
        {
          status: "error",
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const response = await fetch(
      `https://tccia.kalen.co.tz/api/user/me`,
      {
        method: "GET",
        headers: {
      
          Authorization: `Bearer ${token.value.trim()}`,
        },
      }
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      console.error("External API error:", errorData);
      
      // If the external API returns 401 or invalid token error, propagate it properly
      if (response.status === 401 || 
          (typeof errorData === 'object' && errorData.error && 
           (errorData.error.toLowerCase().includes('token') || 
            errorData.error.toLowerCase().includes('unauthorized')))) {
        console.log("🔴 /api/user_profile: Invalid token detected, clearing cookies and returning 401");
        
        // Clear the invalid token
        const cookieStore = await cookies();
        cookieStore.delete("token");
        cookieStore.delete("uid");
        
        return NextResponse.json(
          { 
            error: "Invalid or expired authentication token",
            code: "AUTHENTICATION_FAILED"
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch user profile from external service" },
        { status: response.status }
      );
    }

    const result = await response.json();
    // console.log("User profile result:", result);

    // Return the direct response data
    return NextResponse.json({
      success: true,
      data: result,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}