import nodemailer from "nodemailer";

export type SendFirmOtpResult =
  | { ok: true }
  | { ok: false; error: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildFirmOtpEmailHtml(opts: {
  code: string;
  companyName?: string;
  companyTin?: string;
}): string {
  const name = opts.companyName?.trim() || "—";
  const tin = opts.companyTin?.trim() || "—";
  const code = escapeHtml(opts.code);

  const blueHeader = "#1e4a92";
  const blueDark = "#1e3a8a";
  const blueSoft = "#e8f1fc";
  const text = "#1f2937";
  const muted = "#6b7280";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>TNCC verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f2f5;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.08);">
          <tr>
            <td align="center" style="background-color:${blueHeader};padding:22px 20px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#ffffff;line-height:1.3;">TNCC Company Registration</span>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:${text};">
              <p style="margin:0 0 14px;">Hello,</p>
              <p style="margin:0 0 22px;">You have requested a verification code for company registration:</p>
              <p style="margin:0 0 10px;color:${text};">
                <strong>Company Name:</strong> ${escapeHtml(name)}
              </p>
              <p style="margin:0 0 26px;color:${text};">
                <strong>TIN:</strong> ${escapeHtml(tin)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${blueSoft};border-radius:10px;border:1px solid #cfe0f5;">
                <tr>
                  <td align="center" style="padding:26px 20px;">
                    <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${blueHeader};font-weight:600;">Your verification code is:</p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:38px;font-weight:bold;color:${blueDark};letter-spacing:10px;line-height:1.2;">${code}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${text};">
                <strong>Important:</strong> This code will expire in 5 minutes. Please use it to complete your company registration.
              </p>
              <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#4b5563;">
                If you did not request this code, please ignore this email.
              </p>
              <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${text};">Best regards,</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:${text};">TNCC Registration Team</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color:#eceff2;padding:16px 20px;border-top:1px solid #e2e6ea;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${muted};line-height:1.4;">Tanzania National Chamber of Commerce</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildFirmOtpEmailText(opts: {
  code: string;
  companyName?: string;
  companyTin?: string;
}): string {
  const name = opts.companyName?.trim() || "—";
  const tin = opts.companyTin?.trim() || "—";
  return [
    "TNCC Company Registration",
    "",
    "Hello,",
    "",
    "You have requested a verification code for company registration:",
    "",
    `Company Name: ${name}`,
    `TIN: ${tin}`,
    "",
    `Your verification code is: ${opts.code}`,
    "",
    "Important: This code will expire in 5 minutes. Please use it to complete your company registration.",
    "",
    "If you did not request this code, please ignore this email.",
    "",
    "Best regards,",
    "TNCC Registration Team",
    "",
    "Tanzania National Chamber of Commerce",
  ].join("\n");
}

/**
 * Sends firm-registration OTP via Hostinger SMTP (or any SMTP in env).
 * Must only be called from server-side code.
 */
export async function sendFirmOtpEmail(opts: {
  to: string;
  code: string;
  companyName?: string;
  companyTin?: string;
}): Promise<SendFirmOtpResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { ok: false, error: "SMTP not configured" };
  }

  const port = Number(SMTP_PORT) || 465;
  const secure =
    process.env.SMTP_SECURE === "true" ||
    (process.env.SMTP_SECURE !== "false" && port === 465);

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER.replace(/^"|"$/g, ""),
      pass: SMTP_PASS.replace(/^"|"$/g, ""),
    },
  });

  const from = (SMTP_FROM || SMTP_USER).replace(/^"|"$/g, "");
  const subject = opts.companyName
    ? `Verification code — ${opts.companyName}`
    : "TNCC — Company registration verification code";

  const text = buildFirmOtpEmailText({
    code: opts.code,
    companyName: opts.companyName,
    companyTin: opts.companyTin,
  });

  const html = buildFirmOtpEmailHtml({
    code: opts.code,
    companyName: opts.companyName,
    companyTin: opts.companyTin,
  });

  try {
    await transporter.sendMail({
      from,
      to: opts.to,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email";
    console.error("[sendFirmOtpEmail]", message);
    return { ok: false, error: message };
  }
}
