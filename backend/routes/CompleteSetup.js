import express from "express";
import bcrypt from "bcrypt";
import LoginModel from "../models/login.js";

const CompleteSetup = express.Router();

CompleteSetup.post("/complete-setup/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await LoginModel.findOne({
      setupToken: token,
      setupTokenExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.setupToken = undefined;
    user.setupTokenExpires = undefined;
    user.isSetupComplete = true;
    await user.save();

    res.json({ message: "🎉 Password set successfully. You can now log in!" });
  } catch (error) {
    console.error("Error completing setup:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default CompleteSetup;
