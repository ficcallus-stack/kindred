/**
 * KindredCare US — Email Templates
 * All templates use inline CSS + table layout for maximum email client compatibility.
 * Brand colors: Primary #031f41, Secondary #8e4e14, Accent #ffb780
 */

const BRAND = {
  name: "KindredCare US",
  color: "#031f41",
  accent: "#ffb780",
  secondary: "#8e4e14",
  bg: "#f9f9f9",
  cardBg: "#ffffff",
  textPrimary: "#1a1c1c",
  textSecondary: "#44474e",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://www.kindredcareus.com",
};

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="color-scheme" content="light"/>
  <meta name="supported-color-schemes" content="light"/>
  <title>KindredCare US</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:24px;font-weight:800;color:${BRAND.color};letter-spacing:-0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">KindredCare <span style="color:${BRAND.secondary};font-style:italic;">US</span></span>
            </td>
          </tr>
          <!-- Card Body -->
          <tr>
            <td style="background-color:${BRAND.cardBg};border-radius:16px;padding:48px 40px;box-shadow:0 2px 16px rgba(0,0,0,0.04);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                © ${new Date().getFullYear()} KindredCare US. Secure & Verified Caregiving.<br/>
                <a href="${BRAND.url}/safety" style="color:#999;text-decoration:underline;">Trust & Safety</a> · 
                <a href="${BRAND.url}" style="color:#999;text-decoration:underline;">Visit Website</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#bbb;">
                You're receiving this because you have an account at kindredcareus.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function btn(text: string, url: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:24px 0;">
        <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,${BRAND.color},#1d3557);color:#ffffff;font-size:15px;font-weight:700;padding:16px 40px;border-radius:12px;text-decoration:none;letter-spacing:0.5px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

// ─── 1. OTP Verification ───

export function otpEmailTemplate(name: string, otp: string) {
  return layout(`
    <td align="center">
      <div style="width:64px;height:64px;background-color:#f3f3f3;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;">
        <span style="font-size:28px;">✉️</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.color};letter-spacing:-0.5px;">Verify your email</h1>
      <p style="margin:0 0 32px;font-size:15px;color:${BRAND.textSecondary};line-height:1.6;">
        Hi ${name}, enter this code to finish setting up your KindredCare account.
      </p>
      <div style="background-color:#f9f9f9;border-radius:12px;padding:24px 40px;display:inline-block;margin-bottom:32px;">
        <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:${BRAND.color};font-family:monospace;">${otp}</span>
      </div>
      <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
        This code expires in <strong>10 minutes</strong>. If you didn't create an account, ignore this email.
      </p>
    </td>
  `);
}

export function otpEmailText(name: string, otp: string) {
  return `Hi ${name},\n\nYour KindredCare verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't create an account, ignore this email.\n\n— KindredCare US`;
}

// ─── 2. Welcome ───

export function welcomeEmailTemplate(name: string, role: string) {
  const isParent = role === "parent";
  const greeting = isParent
    ? "You're all set to find trusted, certified caregivers for your family."
    : "You're ready to connect with families looking for experienced caregivers.";
  const ctaUrl = isParent ? `${BRAND.url}/browse` : `${BRAND.url}/jobs`;
  const ctaText = isParent ? "Browse Caregivers" : "Find Jobs";

  return layout(`
    <td>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.color};">Welcome to KindredCare! 🎉</h1>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textSecondary};line-height:1.7;">
        Hi ${name}, ${greeting}
      </p>
      <div style="background-color:#f9f9f9;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:${BRAND.textPrimary};font-weight:600;">What's next?</p>
        <ul style="margin:12px 0 0;padding-left:20px;font-size:14px;color:${BRAND.textSecondary};line-height:2;">
          ${isParent
            ? `<li>Browse verified caregivers in your area</li>
               <li>Post a job to receive applications</li>
               <li>Book and pay securely through our platform</li>`
            : `<li>Complete your profile and upload certifications</li>
               <li>Browse and apply to job listings</li>
               <li>Get booked and earn through our secure wallet</li>`
          }
        </ul>
      </div>
      ${btn(ctaText, ctaUrl)}
    </td>
  `);
}

export function welcomeEmailText(name: string, role: string) {
  return `Welcome to KindredCare, ${name}!\n\nYour account is verified and ready to go.\n\nVisit ${BRAND.url} to get started.\n\n— KindredCare US`;
}

// ─── 3. Password Reset ───

export function passwordResetTemplate(name: string, resetLink: string) {
  return layout(`
    <td>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.color};">Reset your password</h1>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textSecondary};line-height:1.7;">
        Hi ${name}, we received a request to reset your password. Click the button below to create a new one.
      </p>
      ${btn("Reset Password", resetLink)}
      <p style="margin:0;font-size:13px;color:#999;line-height:1.6;">
        If you didn't request this, you can safely ignore this email. The link expires in 1 hour.
      </p>
    </td>
  `);
}

export function passwordResetText(name: string, resetLink: string) {
  return `Hi ${name},\n\nReset your password here: ${resetLink}\n\nIf you didn't request this, ignore this email.\n\n— KindredCare US`;
}

// ─── 4. New Application ───

export function newApplicationTemplate(parentName: string, nannyName: string, jobTitle: string) {
  return layout(`
    <td>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.color};">New Application Received 📋</h1>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textSecondary};line-height:1.7;">
        Hi ${parentName}, <strong>${nannyName}</strong> has applied to your job listing: <strong>"${jobTitle}"</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:${BRAND.textSecondary};">
        Review their profile and experience to decide if they're a good fit for your family.
      </p>
      ${btn("Review Application", `${BRAND.url}/dashboard/parent/applicants`)}
    </td>
  `);
}

export function newApplicationText(parentName: string, nannyName: string, jobTitle: string) {
  return `Hi ${parentName},\n\n${nannyName} has applied to your job "${jobTitle}".\n\nReview at: ${BRAND.url}/dashboard/parent/applicants\n\n— KindredCare US`;
}

// ─── 5/6. Application Status ───

export function applicationStatusTemplate(nannyName: string, jobTitle: string, status: "accepted" | "rejected") {
  const isAccepted = status === "accepted";
  return layout(`
    <td>
      <div style="width:56px;height:56px;background-color:${isAccepted ? "#e8f5e9" : "#fff3e0"};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:24px;">${isAccepted ? "🎉" : "📝"}</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.color};">
        ${isAccepted ? "Application Accepted!" : "Application Update"}
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textSecondary};line-height:1.7;">
        Hi ${nannyName}, your application for <strong>"${jobTitle}"</strong> has been 
        <strong style="color:${isAccepted ? "#2e7d32" : BRAND.secondary};">${status}</strong>.
      </p>
      ${isAccepted
        ? `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.textSecondary};">The family will reach out to you shortly to discuss next steps. Check your messages!</p>
           ${btn("View Messages", `${BRAND.url}/dashboard/messages`)}`
        : `<p style="margin:0 0 16px;font-size:14px;color:${BRAND.textSecondary};">Don't be discouraged — there are many families looking for great caregivers like you!</p>
           ${btn("Browse More Jobs", `${BRAND.url}/jobs`)}`
      }
    </td>
  `);
}

export function applicationStatusText(nannyName: string, jobTitle: string, status: "accepted" | "rejected") {
  return `Hi ${nannyName},\n\nYour application for "${jobTitle}" has been ${status}.\n\nVisit ${BRAND.url} for more.\n\n— KindredCare US`;
}

// ─── 7/8/9. Bookings ───

export function bookingEmailTemplate(
  name: string,
  type: "confirmed" | "cancelled" | "completed",
  details: { jobTitle?: string; amount?: number; bookingId: string }
) {
  const cfg = {
    confirmed: { emoji: "✅", title: "Booking Confirmed!", color: "#2e7d32", msg: "A new booking has been confirmed. Check the details in your dashboard." },
    cancelled: { emoji: "❌", title: "Booking Cancelled", color: "#c62828", msg: "A booking has been cancelled. Any held funds will be released." },
    completed: { emoji: "💰", title: "Booking Completed!", color: "#2e7d32", msg: "The booking is complete and payment has been released to your wallet." },
  }[type];

  return layout(`
    <td>
      <div style="width:56px;height:56px;background-color:${type === "cancelled" ? "#fce4ec" : "#e8f5e9"};border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:24px;">${cfg.emoji}</span>
      </div>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:${BRAND.color};">${cfg.title}</h1>
      <p style="margin:0 0 24px;font-size:15px;color:${BRAND.textSecondary};line-height:1.7;">
        Hi ${name}, ${cfg.msg}
      </p>
      <div style="background-color:#f9f9f9;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#999;padding-bottom:8px;">Booking ID</td>
            <td align="right" style="font-size:13px;font-weight:700;color:${BRAND.textPrimary};padding-bottom:8px;">#${details.bookingId.slice(0, 8).toUpperCase()}</td>
          </tr>
          ${details.amount ? `
          <tr>
            <td style="font-size:13px;color:#999;">Amount</td>
            <td align="right" style="font-size:13px;font-weight:700;color:${cfg.color};">$${(details.amount / 100).toFixed(2)}</td>
          </tr>` : ""}
        </table>
      </div>
      ${btn("View Dashboard", `${BRAND.url}/dashboard`)}
    </td>
  `);
}

export function bookingEmailText(
  name: string,
  type: "confirmed" | "cancelled" | "completed",
  details: { jobTitle?: string; amount?: number; bookingId: string }
) {
  const msg = {
    confirmed: "Your booking has been confirmed.",
    cancelled: "A booking has been cancelled.",
    completed: "Booking completed and payment released.",
  }[type];
  return `Hi ${name},\n\n${msg}\n\nBooking ID: #${details.bookingId.slice(0, 8)}\n${details.amount ? `Amount: $${(details.amount / 100).toFixed(2)}` : ""}\n\nView at: ${BRAND.url}/dashboard\n\n— KindredCare US`;
}
