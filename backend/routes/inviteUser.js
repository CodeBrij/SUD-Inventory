import express from "express";
import crypto from "crypto";
import sendEmail from "../middleware/sendEmail.js";
import LoginModel from "../models/login.js";

const InviteUser = express.Router();

InviteUser.post("/send-setup-links", async (req, res) => {
  try {
    const { email, name } = req.body;

    let user = await LoginModel.findOne({ email });

    // If user doesn't exist, create one
    if (!user) {
      user = new LoginModel({ email, name });
    }

    // Generate token and expiration
    const token = crypto.randomBytes(32).toString("hex");
    user.setupToken = token;
    user.setupTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
    user.name = name;
    await user.save();

    const setupLink = `http://localhost:5173/setup-password/${token}`;

    const emailContent = `
      <p>Hi ${user.name || "there"},</p>
      <p>You’ve been added to the Inventory Management System.</p>
      <p>Please click below to set your password (link valid for 24 hours):</p>
      <a href="${setupLink}">${setupLink}</a>
      <p>Thanks,<br/>Admin Team</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Set your password – Inventory System",
      html: emailContent,
    });

    res.json({ message: "✅ Setup email sent successfully!" });
  } catch (err) {
    console.error("❌ Error sending setup email:", err);
    res.status(500).json({ message: "Error sending setup email." });
  }
});

export default InviteUser;
