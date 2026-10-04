const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("[email] SMTP not configured - skipping actual send. Would have sent:", { to, subject });
      return { skipped: true };
    }
    return await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("[email] send failed:", err.message);
    // Do not throw - a failed email should never block core app flow (e.g. student creation)
    return { error: err.message };
  }
};

const otpEmailTemplate = (code) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#f97316">EduFlow</h2>
    <p>Your OTP verification code:</p>
    <h1 style="letter-spacing:6px">${code}</h1>
    <p>This code will expire in 10 minutes.</p>
  </div>
`;

const credentialsEmailTemplate = ({ name, id, email, password, role }) => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#f97316">EduFlow</h2>
    <p>Hi ${name}, your ${role} account has been created.</p>
    <p><b>ID:</b> ${id}<br/><b>Email:</b> ${email}<br/><b>Password:</b> ${password}</p>
    <p>Please log in and change your password.</p>
  </div>
`;

module.exports = { sendEmail, generateOtp, otpEmailTemplate, credentialsEmailTemplate };
