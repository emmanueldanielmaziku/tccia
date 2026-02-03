import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = "https://tcpdev.kalen.co.tz";

const STATIC_MODULES = [
  { id: 1, name: "Company Registration", code: "company_registration" },
  { id: 2, name: "Factory Verification", code: "factory_verification" },
  { id: 3, name: "Certificate of Origin", code: "certificate_origin" },
  { id: 4, name: "Membership", code: "membership" },
  { id: 5, name: "Employee Management", code: "employee_management" },
];

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Invalid token", status: 401 },
      { status: 401 }
    );
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/api/modules`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    // If upstream returns something usable, pass it through.
    if (upstream.ok) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    }
  } catch {
    // fall through to static
  }

  return NextResponse.json(
    { success: true, modules: STATIC_MODULES, status: 200 },
    { status: 200 }
  );
}


