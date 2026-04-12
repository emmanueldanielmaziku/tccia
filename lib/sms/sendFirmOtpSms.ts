import { sendTextSingleSms } from "./sendTextSingleSms";

export type SendFirmOtpSmsResult =
  | { ok: true }
  | { ok: false; error: string };

/** Digits only; messaging-service example uses e.g. 255769465102 */
export function normalizeSmsPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return null;
  return digits;
}

export function buildFirmOtpSmsBody(code: string, companyName?: string): string {
  const name = companyName?.trim();
  const intro = name
    ? `TNCC (${name}): Your registration code is ${code}.`
    : `TNCC: Your company registration code is ${code}.`;
  return `${intro} Valid for 5 minutes. Do not share.`;
}

export async function sendFirmOtpSmsMessage(opts: {
  toDigits: string;
  verificationCode: string;
  companyTin: string;
  companyName?: string;
}): Promise<SendFirmOtpSmsResult> {
  const text = buildFirmOtpSmsBody(opts.verificationCode, opts.companyName);
  const reference = `tncc-firm-${opts.companyTin}-${Date.now()}`;
  return sendTextSingleSms({
    to: opts.toDigits,
    text,
    reference,
  });
}
