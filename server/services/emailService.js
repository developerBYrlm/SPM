import createMailTransporter from "../utils/mailTransporter.js";

export const sendEmail = async ({ to, subject, html }) => {
  const fromName =
    process.env.MAIL_FROM_NAME || "Special Exam Application System";

  const fromEmail =
    process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  const mailTransporter = createMailTransporter();

  await mailTransporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  });
};