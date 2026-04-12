import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  normalizeSmsPhone,
  sendFirmOtpSmsMessage,
} from "@/lib/sms/sendFirmOtpSms";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const rawPhone = String(body.to ?? body.phone ?? "").trim();
    const verification_code = String(body.verification_code ?? "").trim();
    const company_name = body.company_name
      ? String(body.company_name).trim()
      : undefined;
    const company_tin = body.company_tin
      ? String(body.company_tin).trim()
      : undefined;

    const to = normalizeSmsPhone(rawPhone);
    if (!to) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    if (!/^\d{6}$/.test(verification_code)) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    if (!company_tin || company_tin.length > 64) {
      return NextResponse.json({ error: "Invalid TIN" }, { status: 400 });
    }

    const result = await sendFirmOtpSmsMessage({
      toDigits: to,
      verificationCode: verification_code,
      companyTin: company_tin,
      companyName: company_name,
    });

    if (!result.ok) {
      return NextResponse.json(
        { sent: false, message: result.error },
        { status: 200 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("[firm-registration-otp-sms]", error);
    return NextResponse.json(
      { sent: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
