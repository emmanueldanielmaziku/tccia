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

    // Handle FormData for file uploads
    const formData = await request.formData();
    const body: any = {};
    
    // Extract form fields
    for (const [key, value] of formData.entries()) {
      if (key === 'attachment') {
        body[key] = value; // This will be the file
      } else {
        body[key] = value.toString();
      }
    }

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
      // New optional location fields
      latitude,
      longitude,
      location_type,
      location_accuracy,
      location_address,
      google_place_id,
    } = body;

    // Validate required fields
    if (
      !ntb_type_id ||
      !date_of_incident ||
      !country_of_incident ||
      !location ||
      !complaint_details ||
      !product_description ||
      !occurrence
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const payload: any = {
      ntb_type_id,
      date_of_incident,
      country_of_incident,
      location,
      complaint_details,
      product_description,
      occurrence,
    };

    // Add optional fields if present
    if (cost_value_range) payload.cost_value_range = cost_value_range;
    if (hs_code) payload.hs_code = hs_code;
    if (hs_description) payload.hs_description = hs_description;
    if (time_lost_range) payload.time_lost_range = time_lost_range;
    if (money_lost_range) payload.money_lost_range = money_lost_range;
    if (exact_loss_value) payload.exact_loss_value = exact_loss_value;
    if (loss_calculation_description) payload.loss_calculation_description = loss_calculation_description;
    
    // Add optional location fields
    if (latitude) payload.latitude = latitude;
    if (longitude) payload.longitude = longitude;
    if (location_type) payload.location_type = location_type;
    if (location_accuracy) payload.location_accuracy = location_accuracy;
    if (location_address) payload.location_address = location_address;
    if (google_place_id) payload.google_place_id = google_place_id;

    // Handle file attachments - separate by type
    const documentFiles: File[] = [];
    const imageFiles: File[] = [];
    const videoFiles: File[] = [];

    // Process file attachments
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('document_files') && value instanceof File) {
        documentFiles.push(value);
      } else if (key.startsWith('image_files') && value instanceof File) {
        imageFiles.push(value);
      } else if (key.startsWith('video_files') && value instanceof File) {
        videoFiles.push(value);
      }
    }

    console.log("NTB Submit Payload:", JSON.stringify(payload, null, 2));

    // Create FormData for external API call
    let requestBody: FormData;
    let headers: any = {
      Authorization: `Bearer ${token.value.trim()}`,
    };

    const externalFormData = new FormData();
    
    // Add all payload fields
    Object.keys(payload).forEach(key => {
      externalFormData.append(key, payload[key]);
    });

    // Add files by type
    documentFiles.forEach((file, index) => {
      externalFormData.append(`document_files`, file);
    });
    
    imageFiles.forEach((file, index) => {
      externalFormData.append(`image_files`, file);
    });
    
    videoFiles.forEach((file, index) => {
      externalFormData.append(`video_files`, file);
    });

    requestBody = externalFormData;

    const response = await fetch(
      `${API_BASE_URL}/api/ntb/create-with-files`,
      {
        method: "POST",
        headers,
        body: requestBody,
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
