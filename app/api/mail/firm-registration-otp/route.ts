import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendFirmOtpEmail } from "@/lib/mail/sendFirmOtpEmail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const to = String(body.to ?? "").trim();
    const verification_code = String(body.verification_code ?? "").trim();
    const company_name = body.company_name
      ? String(body.company_name).trim()
      : undefined;
    const company_tin = body.company_tin
      ? String(body.company_tin).trim()
      : undefined;

    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(verification_code)) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (company_tin && company_tin.length > 64) {
      return NextResponse.json({ error: "Invalid TIN" }, { status: 400 });
    }

    const result = await sendFirmOtpEmail({
      to,
      code: verification_code,
      companyName: company_name,
      companyTin: company_tin,
    });

    if (!result.ok) {
      return NextResponse.json(
        { sent: false, message: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[firm-registration-otp]", error);
    return NextResponse.json(
      { sent: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
