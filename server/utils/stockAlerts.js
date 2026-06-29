const User = require("../models/User");
const { sendEmail } = require("../config/email");
const { lowStockEmail } = require("./emailTemplates");
const { logActivity } = require("./activityLogger");

const sendLowStockAlert = async (product, oldStock, oldMinStock) => {
  const previouslyLow = oldStock <= oldMinStock;
  const currentlyLow = product.stock <= product.minStock;
  const shouldNotify = currentlyLow && !previouslyLow;

  if (!shouldNotify) return;

  const recipients = await User.find({
    role: { $in: ["admin", "manager"] },
    isActive: true,
    email: { $exists: true, $ne: "" },
  }).select("email name role");

  const fallbackRecipients = [
    process.env.EMAIL_USER,
    process.env.EMAIL_FROM,
  ].filter(Boolean);

  const uniqueRecipients = Array.from(
    new Map(
      [...recipients.map((recipient) => ({
        email: recipient.email.toLowerCase(),
        name: recipient.name,
        role: recipient.role,
      })), ...fallbackRecipients.map((email) => ({ email: email.toLowerCase(), name: "System", role: "system" }))]
        .filter((recipient) => recipient.email)
        .map((recipient) => [recipient.email, recipient])
    ).values()
  );

  if (!uniqueRecipients.length) return;

  const { subject, html } = lowStockEmail(product);

  await Promise.all(
    uniqueRecipients.map((recipient) =>
      sendEmail(recipient.email, subject, html).catch((error) => {
        console.error(`Failed to send low stock email to ${recipient.email}:`, error);
      })
    )
  );

  await logActivity(`Low stock alert sent: ${product.name}`, "products", null);
};

module.exports = { sendLowStockAlert };