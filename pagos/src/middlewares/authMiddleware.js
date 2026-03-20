import jwt from 'jsonwebtoken';
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

export const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format. Use Bearer" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const userRole = req.user.role_id || req.user.rol_id;

        if (Number(userRole) === 1) {
            return next();
        }

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden: Insufficient role" });
        }
        next();
    };
};