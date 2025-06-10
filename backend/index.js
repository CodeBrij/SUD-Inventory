import express from "express";
import cors from "cors";
import dotenv from "dotenv"
dotenv.config();
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import loginRouter from "./routes/login.js";
import InventoryRouter from "./routes/inventory.js";
import GenerateExcelReportRouter from "./routes/generateExcelReport.js";
import InviteUser from "./routes/inviteUser.js";
import CompleteSetup from "./routes/CompleteSetup.js";
import jwtAuth from "./middleware/auth.js";
const app = express();
import path from "path";

// CORS configuration for frontend
app.use(cors({
    origin: [
        "http://localhost:5173"
    ], 
    credentials: true, // Allow credentials (cookies)
}))

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", loginRouter);
app.use("/inventory",InventoryRouter);
app.use("/generate-report", GenerateExcelReportRouter);
app.use("/send", InviteUser);
app.use("/api/invite", CompleteSetup);

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

connectDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});