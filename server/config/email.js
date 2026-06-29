const nodemailer = require("nodemailer");

const emailHost = process.env.EMAIL_HOST?.trim();
const emailPort = parseInt(process.env.EMAIL_PORT || "587", 10);
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const emailSecure = process.env.EMAIL_SECURE === "true" || emailPort === 465;
const emailTlsRejectUnauthorized = process.env.EMAIL_REJECT_UNAUTHORIZED !== "false";

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailSecure,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: emailTlsRejectUnauthorized,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

if (!emailHost || !emailUser || !emailPass) {
  console.error(
    "❌ Email SMTP configuration is missing. Make sure EMAIL_HOST, EMAIL_USER, and EMAIL_PASS are set."
  );
} else {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email Config Error:", error.message);
    } else {
      console.log("✅ Email Config Valid - Ready to send emails!");
    }
  });
}

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email SMTP configuration is missing");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
};

module.exports = { sendEmail };