import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const body = await request.json();

    // For employees during login (password_change_required), we might not have a token
    // In this case, we need login credentials to authenticate the password change
    const isEmployeeLoginPasswordChange = body.login && !token;
    
    
    const isEmployeePasswordChange = body.is_employee_password_change === true || isEmployeeLoginPasswordChange;
    
    // Validate required fields
    if (!isEmployeePasswordChange && !body.old_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "old_password is required",
          },
        },
        { status: 400 }
      );
    }
    
    if (!body.new_password || !body.confirm_password) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: null,
          result: {
            error: "new_password and confirm_password are required",
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

    // Prepare request body according to README: employees only need new_password and confirm_password
    const requestBody: any = {
      new_password: body.new_password,
      confirm_password: body.confirm_password,
    };

    // Only add old_password if it's not an employee password change
    if (!isEmployeePasswordChange && body.old_password) {
      requestBody.old_password = body.old_password;
    }

    // If we have login credentials but no token (employee login password change),
    // the backend might accept login in the request body
    if (isEmployeeLoginPasswordChange && body.login) {
      requestBody.login = body.login;
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header only if we have a token
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
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
