import jwt from 'jsonwebtoken';
import LoginModel from "../models/login.js";

const jwtAuth = (requiredRoles = []) => async (req, res, next) => {
    try {
        if (!req.cookies || !req.cookies.token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }
        
        console.log("token : ", req.cookies.token);
        const payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.userId = payload.userId;

        console.log(payload.userId);
        
        const user = await LoginModel.findById(payload.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log(user);
        
        // Check roles after we have the user object
        if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }
        
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