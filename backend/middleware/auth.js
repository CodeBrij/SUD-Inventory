import jwt from 'jsonwebtoken';
import LoginModel from "../models/login.js";

const jwtAuth = async (req, res, next) => {
    try {
        if (!req.cookies || !req.cookies.token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        console.log("token : ", req.cookies.token)
        const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.userId = payload.userId;

        console.log(payload.userId);
        

        const user = await LoginModel.findById(payload.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
          }

        console.log(user);
        
      
        // saving the user in req.user
        req.user = user;
        next();
    } catch (error) {
        console.error("Unauthorized: ", error.message);
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token has expired" });
        }
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

export default jwtAuth; 