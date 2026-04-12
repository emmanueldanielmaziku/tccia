export type SendTextSingleSmsResult =
  | { ok: true }
  | { ok: false; error: string };

const DEFAULT_SMS_URL =
  "https://messaging-service.co.tz/api/sms/v2/text/single";

/**
 * messaging-service.co.tz — POST /api/sms/v2/text/single
 * Env: SMS_API_BEARER_TOKEN (required), SMS_FROM (default TNCC), SMS_API_URL (optional override)
 */
export async function sendTextSingleSms(opts: {
  to: string;
  text: string;
  reference: string;
}): Promise<SendTextSingleSmsResult> {
  const token = process.env.SMS_API_BEARER_TOKEN?.replace(/^"|"$/g, "");
  const from = (process.env.SMS_FROM || "TNCC").replace(/^"|"$/g, "");
  const url = process.env.SMS_API_URL || DEFAULT_SMS_URL;

  if (!token) {
    return { ok: false, error: "SMS API not configured" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        text: opts.text,
        reference: opts.reference,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      const err = body || `${response.status} ${response.statusText}`;
      console.error("[sendTextSingleSms]", err);
      return { ok: false, error: err };
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "SMS request failed";
    console.error("[sendTextSingleSms]", message);
    return { ok: false, error: message };
  }
}
