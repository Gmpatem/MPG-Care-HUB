export type SendHospitalInvitationEmailInput = {
  to: string;
  hospitalSlug: string;
  role: string;
  inviteUrl: string;
};

export type SendHospitalInvitationEmailResult = {
  attempted: boolean;
  sent: boolean;
  error?: string;
};

export async function sendHospitalInvitationEmail(
  input: SendHospitalInvitationEmailInput
): Promise<SendHospitalInvitationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.INVITE_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return {
      attempted: false,
      sent: false,
      error: "Automatic email is not configured. Set RESEND_API_KEY and INVITE_FROM_EMAIL.",
    };
  }

  const subject = `You're invited to MPG Care Hub`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hospital Access Invitation</h2>
      <p>You have been invited to join hospital <strong>${escapeHtml(input.hospitalSlug)}</strong> as <strong>${escapeHtml(input.role)}</strong>.</p>
      <p>
        <a href="${escapeAttribute(input.inviteUrl)}" style="display:inline-block;padding:10px 14px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">
          Accept invitation
        </a>
      </p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p>${escapeHtml(input.inviteUrl)}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [input.to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      attempted: true,
      sent: false,
      error: `Email send failed: ${errorText}`,
    };
  }

  return {
    attempted: true,
    sent: true,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value);
}
