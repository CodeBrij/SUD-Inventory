import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({   
    name: {
        type: String,
        required: true
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
        required: true
    },
    confirmPassword: {
        type: String,
    }
},{ timestamps: true });


const LoginModel =  mongoose.models.User ||  mongoose.model('User', loginSchema);

export default LoginModel;
