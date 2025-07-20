import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tccia.kalen.co.tz";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tin: string }> }
) {
  const { tin } = await params;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Missing authentication token.",
          data: null,
        },
        { status: 401 }
      );
    }
    const res = await fetch(
      `${API_BASE_URL}/api/membership/application/${tin}`,
      {
        headers: {
          Authorization: `Bearer ${token.value.trim()}`,
        },
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "No membership application found for this TIN.",
          data: null,
        },
        { status: 404 }
      );
    }
    const data = await res.json();
    if (!data?.success || !data?.data) {
      return NextResponse.json(
        {
          success: false,
          message: "No membership application found for this TIN.",
          data: null,
        },
        { status: 404 }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching membership application.",
        data: null,
      },
      { status: 500 }
    );
  }
}
