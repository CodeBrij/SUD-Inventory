import nodemailer from "nodemailer";

const sendEmailWithAttachment = async (email, message, filePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_GOOGLE_PSWD,
      },
    });

    const mailOptions = {
      from: `"Inventory System" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Inventory Report",
      text: message,
      attachments: [
        {
          filename: "inventory_report.xlsx",
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Email delivery failed");
  }
};

export default sendEmailWithAttachment;
