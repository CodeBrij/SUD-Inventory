import nodemailer from "nodemailer";
const sendEmailWithAttachment = async (email,message, filePath) => {
    try {
      // Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
            user: process.env.ADMIN_EMAIL, // Your email
            pass: process.env.ADMIN_GOOGLE_PSWD, // Your Google pswd
            },
        });

      // Email options
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: email, // Replace with target email
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
        console.log("Email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendEmailWithAttachment;
