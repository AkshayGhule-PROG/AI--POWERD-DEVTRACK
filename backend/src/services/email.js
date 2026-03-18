const nodemailer = require('nodemailer')

/**
 * Send email using Resend (preferred — free 3000/month) or Gmail SMTP.
 * Set RESEND_API_KEY in .env for Resend, or SMTP_USER + SMTP_PASS for Gmail.
 */
const sendEmail = async ({ to, subject, html }) => {
  // ── Option 1: Resend (resend.com — free, easy, modern) ──────────────────
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key') {
    const { Resend } = require('resend') // lazy-load to avoid SES intrinsics error
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.RESEND_FROM || 'DevTrack <onboarding@resend.dev>'
    const result = await resend.emails.send({ from, to, subject, html })
    if (result.error) throw new Error(result.error.message)
    return result
  }

  // ── Option 2: Gmail SMTP (or any SMTP provider) ─────────────────────────
  if (
    process.env.SMTP_USER &&
    process.env.SMTP_USER !== 'your_email@gmail.com' &&
    process.env.SMTP_PASS &&
    process.env.SMTP_PASS !== 'your_email_password'
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    return transporter.sendMail({
      from: `"DevTrack" <${process.env.SMTP_USER}>`,
      to, subject, html,
    })
  }

  // ── Neither configured ───────────────────────────────────────────────────
  throw new Error('EMAIL_NOT_CONFIGURED')
}

const resetPasswordEmail = (resetUrl, userName) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 36px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px;margin-right:10px;">
              <span style="color:white;font-size:20px;font-weight:bold;">⚡</span>
            </td>
            <td style="padding-left:12px;">
              <span style="color:white;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Dev<span style="opacity:0.85;">Track</span></span>
            </td>
          </tr></table>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px;">
          <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;">Reset your password</h2>
          <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
            Hi ${userName}, we received a request to reset your DevTrack password.
            Click the button below — this link expires in <strong>15 minutes</strong>.
          </p>
          <table cellpadding="0" cellspacing="0"><tr><td>
            <a href="${resetUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;box-shadow:0 4px 14px rgba(99,102,241,0.35);">
              Reset Password
            </a>
          </td></tr></table>
          <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
            If you didn't request this, you can safely ignore this email. Your password won't change.
          </p>
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
          <p style="margin:0;color:#cbd5e1;font-size:11px;">Or copy this link: <span style="color:#6366f1;">${resetUrl}</span></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const otpEmail = (otp, userName) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 36px;">
          <span style="color:white;font-size:20px;font-weight:700;">&#9889; DevTrack</span>
        </td></tr>
        <tr><td style="padding:36px;">
          <h2 style="margin:0 0 8px;color:#111827;font-size:22px;">Verify your email</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Hi ${userName || 'there'}, use the code below to confirm your email address. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#f5f3ff;border:2px dashed #a78bfa;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 6px;color:#7c3aed;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Your verification code</p>
            <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#4f46e5;font-family:monospace;">${otp}</div>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:12px;">If you didn't create a DevTrack account, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

module.exports = { sendEmail, resetPasswordEmail, otpEmail }