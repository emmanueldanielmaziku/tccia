import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ user_id: string; record_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { user_id, record_id } = await params;

    if (!user_id || !record_id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and Record ID are required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/ntb/resolution/${encodeURIComponent(user_id)}/${encodeURIComponent(record_id)}`;
    console.log("Fetching NTB resolution from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("API response not ok:", response.status, response.statusText);
      console.error("Error response body:", errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.error || `API request failed: ${response.status} ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error("Non-JSON response from API:", rawText);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response format from API",
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("NTB Resolution API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      if (data.result.status === "success" || data.result.success) {
        return NextResponse.json({
          success: true,
          data: data.result.data || {},
          message: data.result.message || "NTB resolution fetched successfully",
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.result.message || "Failed to fetch NTB resolution",
          },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (data.status === "success" || data.success) {
      return NextResponse.json({
        success: true,
        data: data.data || data.result || {},
        message: data.message || "NTB resolution fetched successfully",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      data: data || {},
      message: "NTB resolution fetched successfully",
    });

  } catch (error) {
    console.error("NTB resolution fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ user_id: string; record_id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const { user_id, record_id } = await params;

    if (!user_id || !record_id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and Record ID are required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { resolution_remarks } = body;

    if (!resolution_remarks || !resolution_remarks.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "resolution_remarks is required",
        },
        { status: 400 }
      );
    }

    const apiUrl = `${API_BASE_URL}/api/ntb/resolution/${encodeURIComponent(user_id)}/${encodeURIComponent(record_id)}`;
    console.log("Submitting NTB resolution to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resolution_remarks: resolution_remarks.trim(),
      }),
    });

    console.log("NTB Resolution API response status:", response.status, response.statusText);
    console.log("NTB Resolution API response headers:", Object.fromEntries(response.headers.entries()));

    // Handle 201 CREATED (success)
    if (response.status === 201) {
      let responseData;
      try {
        const responseText = await response.text();
        console.log("NTB Resolution API response body (text):", responseText);
        
        // Try to parse as JSON
        try {
          responseData = JSON.parse(responseText);
          console.log("NTB Resolution API response body (parsed):", responseData);
        } catch {
          // If not JSON, might be the string response representation
          responseData = { raw: responseText };
        }

        // Handle JSON-RPC format with string result
        if (responseData.jsonrpc && typeof responseData.result === 'string') {
          // Result is a string like "<Response 85 bytes [201 CREATED]>"
          // This indicates success based on status code
          return NextResponse.json({
            success: true,
            message: "Resolution submitted successfully",
          });
        }

        // Handle normal JSON-RPC success
        if (responseData.jsonrpc && responseData.result) {
          if (typeof responseData.result === 'object' && (responseData.result.success || responseData.result.status === "success")) {
            return NextResponse.json({
              success: true,
              message: responseData.result.message || "Resolution submitted successfully",
              resolution_id: responseData.result.resolution_id || responseData.result.data?.resolution_id,
            });
          }
        }

        // Standard success response
        return NextResponse.json({
          success: true,
          message: responseData.message || "Resolution submitted successfully",
          resolution_id: responseData.resolution_id || responseData.data?.resolution_id,
        });
      } catch (error) {
        console.error("Error parsing success response:", error);
        // Even if parsing fails, 201 means success
        return NextResponse.json({
          success: true,
          message: "Resolution submitted successfully",
        });
      }
    }

    // Handle 400 BAD REQUEST (error)
    if (response.status === 400) {
      let errorData;
      try {
        const errorText = await response.text();
        console.log("NTB Resolution API error body (text):", errorText);
        
        try {
          errorData = JSON.parse(errorText);
          console.log("NTB Resolution API error body (parsed):", errorData);
        } catch {
          errorData = { error: errorText };
        }

        // Handle JSON-RPC format with string result
        if (errorData.jsonrpc && typeof errorData.result === 'string') {
          // Result is a string like "<Response 65 bytes [400 BAD REQUEST]>"
          // Check for error field at top level
          let errorMessage = "Failed to submit resolution. Please check your input and try again.";
          
          if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData.error.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.error.data?.message) {
              errorMessage = errorData.error.data.message;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          return NextResponse.json(
            {
              success: false,
              error: errorMessage,
            },
            { status: 400 }
          );
        }

        // Handle normal JSON-RPC error
        if (errorData.jsonrpc && errorData.result) {
          const errorMessage = 
            errorData.result?.message || 
            errorData.result?.error || 
            errorData.error?.message ||
            errorData.message ||
            "Failed to submit resolution. Please check your input and try again.";
          
          return NextResponse.json(
            {
              success: false,
              error: errorMessage,
            },
            { status: 400 }
          );
        }

        // Extract error message from various possible structures
        const errorMessage = 
          errorData.error || 
          errorData.message || 
          errorData.result?.error || 
          errorData.result?.message ||
          (typeof errorData === 'string' ? errorData : null) ||
          "Failed to submit resolution. Please check your input and try again.";

        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
          },
          { status: 400 }
        );
      } catch (error) {
        console.error("Error parsing error response:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to submit resolution. Please check your input and try again.",
          },
          { status: 400 }
        );
      }
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }

      console.error("API response not ok:", response.status, response.statusText);
      console.error("Error response body:", errorData);

      // Extract error message from various possible structures
      const errorMessage = 
        errorData.error || 
        errorData.message || 
        errorData.result?.error || 
        errorData.result?.message ||
        (typeof errorData === 'string' ? errorData : null) ||
        `API request failed: ${response.status} ${response.statusText}`;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: response.status }
      );
    }

    // Handle other success status codes (200, etc.)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error("Non-JSON response from API:", rawText);
      return NextResponse.json({
        success: true,
        message: "Resolution submitted successfully",
      });
    }

    const data = await response.json();
    console.log("NTB Resolution submission API response:", data);

    // Handle JSON-RPC response structure
    if (data.jsonrpc && data.result) {
      // Check if result is a string (Response object representation)
      if (typeof data.result === 'string') {
        // String result like "<Response X bytes [STATUS]>" - treat as success if status is 200-299
        return NextResponse.json({
          success: true,
          message: "Resolution submitted successfully",
        });
      }

      // Normal object result
      if (data.result.status === "success" || data.result.success) {
        return NextResponse.json({
          success: true,
          message: data.result.message || "Resolution submitted successfully",
          resolution_id: data.result.resolution_id || data.result.data?.resolution_id,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: data.result.message || "Failed to submit resolution",
          },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (data.status === "success" || data.success) {
      return NextResponse.json({
        success: true,
        message: data.message || "Resolution submitted successfully",
        resolution_id: data.resolution_id || data.data?.resolution_id,
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      message: "Resolution submitted successfully",
      resolution_id: data.resolution_id,
    });

  } catch (error) {
    console.error("NTB resolution submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

