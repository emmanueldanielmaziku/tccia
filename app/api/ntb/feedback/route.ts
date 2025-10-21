import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    const uid = cookieStore.get("uid");

    if (!token || !uid) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Missing authentication",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ntb_id, rating, comment } = body;

    if (!ntb_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid feedback data. Rating must be between 1-5.",
        },
        { status: 400 }
      );
    }

    const payload = {
      ntb_id: parseInt(ntb_id),
      rating: parseInt(rating),
      comment: comment || "",
      user_id: uid.value,
    };

    console.log("Submitting feedback:", payload);

    const response = await fetch(`${API_BASE_URL}/api/ntb/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("Feedback API response:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Failed to submit feedback",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
      data: data,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}