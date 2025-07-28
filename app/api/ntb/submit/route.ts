import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - Missing authentication" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      ntb_type_id,
      date_of_incident,
      country_of_incident,
      location,
      complaint_details,
      product_description,
      cost_value_range,
      occurrence,
      hs_code,
      hs_description,
      time_lost_range,
      money_lost_range,
      exact_loss_value,
      loss_calculation_description,
    } = body;

    // Validate required fields
    if (
      !ntb_type_id ||
      !date_of_incident ||
      !country_of_incident ||
      !location ||
      !complaint_details ||
      !product_description ||
      !cost_value_range ||
      !occurrence ||
      !time_lost_range ||
      !money_lost_range ||
      exact_loss_value === undefined ||
      !loss_calculation_description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload = {
      ntb_type_id,
      date_of_incident,
      country_of_incident,
      location,
      complaint_details,
      product_description,
      cost_value_range,
      occurrence,
      hs_code,
      hs_description,
      time_lost_range,
      money_lost_range,
      exact_loss_value,
      loss_calculation_description,
    };

    console.log("NTB Submit Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(
      `${API_BASE_URL}/api/ntb/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value.trim()}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("External API error:", errorData);
      return NextResponse.json(
        { error: "Failed to submit report to external service" },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Log the response from external API
    console.log("NTB External API Response:", JSON.stringify(result, null, 2));

    // Handle JSON-RPC response structure
    if (result.jsonrpc && result.result) {
      if (result.result.success) {
        console.log(
          "NTB Success - Report Reference:",
          result.result.data?.report_reference
        );
        return NextResponse.json({
          success: true,
          data: result.result.data,
          message: result.result.message || "NTB report created successfully",
        });
      } else {
        console.log("NTB Error:", result.result.message);
        return NextResponse.json(
          { error: result.result.message || "Failed to submit report" },
          { status: 400 }
        );
      }
    }

    // Handle standard response structure
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message || "NTB report submitted successfully",
      });
    }

    // Fallback for other response structures
    return NextResponse.json({
      success: true,
      data: result,
      message: "NTB report submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting NTB report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
