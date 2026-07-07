import { verifyToken } from "../utils/jwt.utils";
import { Employee } from "../models/Employee";
export const verifyTokenMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Auth] ${req.method} ${req.path} - ${authHeader ? 'has Authorization' : 'missing Authorization'}`);
        }
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ success: false, message: "Access denied. No token provided." });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded) {
            res.status(401).json({ success: false, message: "Invalid or expired token." });
            return;
        }
        const employee = await Employee.findById(decoded.id);
        if (!employee || employee.status !== "Active") {
            res.status(401).json({ success: false, message: "Employee not found or inactive." });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Authentication error." });
    }
};
