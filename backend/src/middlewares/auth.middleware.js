import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
    // Token from cookie (preferred) or Authorization header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
    }

    if (!token) {
        console.warn("[auth] No token found on request", {
            path: req.path,
            method: req.method,
        });
        return res.status(401).json({
            error: "Auth required",
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        console.error("[auth] Token verification failed", {
            path: req.path,
            method: req.method,
            message: error?.message,
        });
        return res.status(401).json({
            error: " invalid token",
        });
    }
};

/** Same as verifyJWT but does not return 401 when no token — only sets req.user when token is valid. */
export const optionalVerifyJWT = async (req, res, next) => {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.replace("Bearer ", "");
    }
    if (!token) return next();
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        return next();
    } catch (_) {
        return next();
    }
};

export default verifyJWT;