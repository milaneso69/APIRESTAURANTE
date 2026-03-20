import jwt from 'jsonwebtoken';
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
}

function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role_id: user.rol_id || user.role_id,
        email: user.email
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

function createErrorResponse(status, message) {
    return { status, message, user: null };
}

function validateJwtToken(authHeader, res) {
    if (!authHeader) {
        return createErrorResponse(401, "Access denied. No token provided.");
    }

    if (!authHeader.startsWith("Bearer ")) {
        return createErrorResponse(401, "Invalid token type. Bearer token required.");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            status: 200,
            user: {
                id: decoded.id,
                username: decoded.username,
                role_id: decoded.role_id,
                email: decoded.email
            },
            message: "Valid token"
        };
    } catch (error) {
        console.error("Error verifying token:", error);
        if (error.name === "TokenExpiredError") {
            return createErrorResponse(401, "Token expired.");
        } else if (error.name === "JsonWebTokenError") {
            return createErrorResponse(403, "Invalid token. Invalid signature.");
        }
        return createErrorResponse(500, "Internal server error during token validation.");
    }
}

function checkRole(roles) {
    return (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            return res.status(401).json({ message: "No authentication token provided" });
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            if (Number(decoded.role_id) === 1) {
                req.user = decoded;
                return next();
            }

            // Verificar si el rol del usuario está en la lista de roles permitidos
            if (!roles.includes(decoded.role_id)) {
                return res.status(403).json({ message: "Access denied. Insufficient role." });
            }
            // Agregar la información del usuario decodificada a req.user
            req.user = decoded;
            next();
        } catch (error) {
            console.error("Error verificando token:", error);
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}

export { generateAccessToken, validateJwtToken, checkRole };
