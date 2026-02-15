// Mailjet HTTP API – no Brevo, no nodemailer.
// Required env: MAILJET_API_KEY, MAILJET_SECRET_KEY
// Optional: MAILJET_FROM (default: "Voting App <maildashboard0@gmail.com>")

import "dotenv/config";

const apiKey = process.env.MAILJET_API_KEY;
const secretKey = process.env.MAILJET_SECRET_KEY;
const fromDefault =
  process.env.MAILJET_FROM || "Voting App <maildashboard0@gmail.com>";

let isConfigured = false;

if (apiKey && secretKey) {
  isConfigured = true;
  console.log("[MAILER] Mailjet client initialized");
} else {
  console.warn(
    "[MAILER] MAILJET_API_KEY or MAILJET_SECRET_KEY missing; outgoing email disabled"
  );
}

function getFrom() {
  const raw = fromDefault;
  const match = raw.match(/^(.+?)\s*<(.+?)>$|^(.+)$/);
  if (match) {
    if (match[2]) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: "Voting App", email: (match[3] || match[1] || raw).trim() };
  }
  return { name: "Voting App", email: raw.trim() };
}

/**
 * Send email via Mailjet API.
 * @param {Object} options - { to, subject, html, text }
 * @returns {Promise<{ messageId, accepted, rejected, response }>}
 */
export const sendMail = async (options = {}) => {
  if (!isConfigured) {
    const err = new Error("Mailjet is not configured");
    err.statusCode = 500;
    throw err;
  }

  const { name: fromName, email: fromEmail } = getFrom();
  const htmlContent =
    options.html ||
    (options.text
      ? `<div style="font-size: 16px; line-height: 1.6;">${options.text.replace(/\n/g, "<br>")}</div>`
      : "");
  const textContent = options.text || options.html || "";

  const payload = {
    Messages: [
      {
        From: { Email: fromEmail, Name: fromName },
        To: [{ Email: options.to }],
        Subject: options.subject || "(No Subject)",
        HTMLPart: htmlContent,
        TextPart: textContent,
      },
    ],
  };

  console.log("[MAILER] Sending via Mailjet", {
    to: options.to,
    subject: payload.Messages[0].Subject,
  });

  const authHeader = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
  const response = await fetch("https://api.mailjet.com/v3.1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { raw: responseText };
  }

  if (!response.ok) {
    const errorMessage =
      responseData.ErrorMessage ||
      responseData.ErrorInfo ||
      responseData.message ||
      `Mailjet API error: ${response.status} ${response.statusText}`;
    if (
      String(errorMessage).toLowerCase().includes("not been validated") ||
      (String(errorMessage).toLowerCase().includes("sender") &&
        String(errorMessage).toLowerCase().includes("validate"))
    ) {
      console.error("[MAILER] Sender must be validated in Mailjet:", fromEmail);
      throw new Error(
        `Sender "${fromEmail}" is not validated. Verify it at https://app.mailjet.com/account/sender`
      );
    }
    throw new Error(errorMessage);
  }

  const messageId =
    responseData.Messages?.[0]?.To?.[0]?.MessageID ||
    responseData.Messages?.[0]?.MessageID ||
    `mailjet-${Date.now()}`;

  return {
    messageId,
    accepted: [options.to],
    rejected: [],
    response: `Mailjet: ${response.status} ${response.statusText}`,
  };
};

export const sendCandidateVerificationEmail = async (toEmail, code) => {
  if (!toEmail) {
    console.warn("[MAILER] No recipient for candidate verification");
    return;
  }
  if (!isConfigured) {
    console.warn(
      "[MAILER] Mailjet not configured. Skipping candidate verification email."
    );
    return;
  }

  console.log("[MAILER] Sending candidate verification email to", toEmail);
  try {
    const info = await sendMail({
      to: toEmail,
      subject: "Your candidate verification code",
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>Enter this code in the app to verify your email.</p>`,
    });
    console.log("[MAILER] Candidate verification email sent", {
      to: toEmail,
      messageId: info?.messageId,
    });
    return info;
  } catch (err) {
    console.error(
      "[MAILER] Failed to send candidate verification email:",
      err?.message || err
    );
    throw err;
  }
};

export const sendResetPasswordEmail = async (toEmail, code) => {
  if (!toEmail) {
    console.warn("[MAILER] No recipient for reset password");
    return;
  }
  if (!isConfigured) {
    console.warn(
      "[MAILER] Mailjet not configured. Skipping reset password email."
    );
    return;
  }

  console.log("[MAILER] Sending reset password OTP to", toEmail);
  try {
    const info = await sendMail({
      to: toEmail,
      subject: "Your password reset code",
      html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>Enter this code to set a new password. Valid for 15 minutes.</p>`,
    });
    console.log("[MAILER] Reset password OTP email sent", {
      to: toEmail,
      messageId: info?.messageId,
    });
    return info;
  } catch (err) {
    console.error(
      "[MAILER] Failed to send reset password email:",
      err?.message || err
    );
    throw err;
  }
};

export const isMailerConfigured = isConfigured;
export default sendCandidateVerificationEmail;
