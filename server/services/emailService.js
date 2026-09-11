import createMailTransporter from "../utils/mailTransporter.js";

// Send email
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createMailTransporter();

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Special Exam System"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
};