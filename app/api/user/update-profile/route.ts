import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const uid = cookieStore.get("uid");

    if (!token || !uid) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32001,
            message: "Unauthorized - Missing authentication"
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { country_of_residence, operator_type, gender, operator_type_other } = body;
    
    if (!country_of_residence || !operator_type || !gender) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32602,
            message: "Missing required fields: country_of_residence, operator_type, and gender are required"
          }
        },
        { status: 400 }
      );
    }

    // If operator_type is "other" or "others", validate operator_type_other (but it can be null otherwise)
    if ((operator_type === "other" || operator_type === "others") && (!operator_type_other || operator_type_other.trim() === "")) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32602,
            message: "operator_type_other is required when operator_type is 'other' or 'others'"
          }
        },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://tccia.kalen.co.tz/api/user/update-profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value.trim()}`,
        },
        body: JSON.stringify(body),
      }
    );

    // console.log("Profile update body:", body);

    if (!response.ok) {
      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32000,
            message: "Failed to update user profile"
          }
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    // console.log("Profile update result:", result);

    // Return JSON-RPC format response matching your specification
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      result: {
        message: "Profile updated successfully",
        updated_fields: {
          country_of_residence,
          operator_type,
          operator_type_other: operator_type_other || "",
          gender
        }
      }
    });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32000,
          message: "Internal server error"
        }
      },
      { status: 500 }
    );
  }
} 