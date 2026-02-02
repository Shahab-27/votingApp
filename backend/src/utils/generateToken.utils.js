import jwt from "jsonwebtoken";

const generateToken = (userData) => {
    return  jwt.sign(
        userData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } 
    );
};

export default generateToken