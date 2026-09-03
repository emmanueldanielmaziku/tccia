import { NextResponse } from "next/server";

const API_BASE_URL = "https://staff.tncc.or.tz";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/membership/regions`);
    const data = await res.json();

    if (data?.data?.regions && Array.isArray(data.data.regions)) {
      data.data.regions.sort((a: any, b: any) => {
        if (a.id === 44) return -1;
        if (b.id === 44) return 1;
        return 0;
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching regions.",
        data: null,
      },
      { status: 500 },
    );
  }
}
