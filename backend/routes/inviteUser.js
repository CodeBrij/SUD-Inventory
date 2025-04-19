// import express from "express";
// import crypto from "crypto";
// import sendEmail from "../middleware/sendEmail.js";
// import LoginModel from "../models/login.js";

// const InviteUser = express.Router();

// InviteUser.post("/send-setup-links", async (req, res) => {
//   try {
//     const { email, name, role } = req.body;

//     let user = await LoginModel.findOne({ email });

//     // If user doesn't exist, create one
//     if (!user) {
//       user = new LoginModel({ email, name });
//     }

//     // Generate token and expiration
//     const token = crypto.randomBytes(32).toString("hex");
//     user.setupToken = token;
//     user.setupTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
//     user.name = name;
//     user.role = role;
//     await user.save();

//     const setupLink = `http://localhost:5173/setup-password/${token}`;

//     const emailContent = `
//       <p>Hi ${user.name || "there"},</p>
//       <p>You’ve been added to the Inventory Management System.</p>
//       <p>Please click below to set your password (link valid for 24 hours):</p>
//       <a href="${setupLink}">${setupLink}</a>
//       <p>Thanks,<br/>Admin Team</p>
//     `;

//     await sendEmail({
//       to: user.email,
//       subject: "Set your password – Inventory System",
//       html: emailContent,
//     });

//     res.json({ message: "✅ Setup email sent successfully!" });
//   } catch (err) {
//     console.error("❌ Error sending setup email:", err);
//     res.status(500).json({ message: "Error sending setup email." });
//   }
// });

// export default InviteUser;



import express from "express";
import crypto from "crypto";
import multer from "multer";
import * as XLSX from "xlsx";
import sendEmail from "../middleware/sendEmail.js";
import LoginModel from "../models/login.js";

const InviteUser = express.Router();

// Configure multer for file upload
const upload = multer({ storage: multer.memoryStorage() });
InviteUser.post("/send-setup-links", upload.single("file"), async (req, res) => {
  try {
    let users = [];

    if (req.file) {
      try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        users = XLSX.utils.sheet_to_json(sheet);
        console.log("📄 Extracted users from Excel:", users);
      } catch (err) {
        console.error("❌ Error parsing Excel file:", err);
        return res.status(400).json({ message: "Invalid Excel file." });
      }
    } else if (req.body.users) {
      try {
        users = typeof req.body.users === "string"
          ? JSON.parse(req.body.users)
          : req.body.users;
        console.log("📦 Received users from JSON:", users);
      } catch (err) {
        console.error("❌ Error parsing JSON users:", err);
        return res.status(400).json({ message: "Invalid user data format." });
      }
    }

    if (!users || users.length === 0) {
      return res.status(400).json({ message: "No user data provided." });
    }

    const responses = [];

    for (const { email, name, role } of users) {
      if (!email || !name || !role) {
        responses.push({ email, status: "❌ Missing required fields" });
        continue;
      }

      try {
        let user = await LoginModel.findOne({ email });

        if (!user) {
          user = new LoginModel({ email, name });
        }

        const token = crypto.randomBytes(32).toString("hex");
        user.setupToken = token;
        user.setupTokenExpires = Date.now() + 1000 * 60 * 60 * 24;
        user.name = name;
        user.role =  role.toLowerCase();
        await user.save();

        // dynamic frontend url 
        const setupLink = `http://localhost:5173/setup-password/${token}`;

        const emailContent = `
          <p>Hi ${user.name},</p>
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

        responses.push({ email, status: "✅ Email sent successfully" });
      } catch (err) {
        console.error(`❌ Error for ${email}:`, err.message);
        responses.push({ email, status: `❌ Error sending email` });
      }
    }

    res.json({ message: "✅ Process completed", data: responses });

  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

export default InviteUser;
