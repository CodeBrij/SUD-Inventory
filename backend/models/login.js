import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
  name: {
    type: String,
  },  
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: false 
  },
  role: {
    type: String,
    enum: ['admin', 'user'], 
    default: 'user', 
  },
  isSetupComplete: { type: Boolean, default: false },
  setupToken: {type:String},
  setupTokenExpires: {type:Date},
}, { timestamps: true });

const LoginModel = mongoose.models.User || mongoose.model('User', loginSchema);

export default LoginModel;
