import createMailTransporter from "../utils/mailTransporter.js";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("=================================");
    console.log("Sending mail to:", to);
    console.log("Subject:", subject);

    const transporter = createMailTransporter();

    await transporter.verify();
    console.log("SMTP Connected Successfully");

    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Mail Sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    throw error;
  }
};