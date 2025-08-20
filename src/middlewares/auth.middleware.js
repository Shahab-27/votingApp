import jwt from "jsonwebtoken";


const verifyJWT = async(req,res , next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(401).json({
            error : "Auth header not found"
        })
    }

    const token = authHeader.replace("Bearer "," ");
    if(!token){
        return res.status(401).json({
            error : "token not found"
        })
    }

    try {
        const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(401).json({
            error : " invalid token"
        })
    }
}


export default verifyJWT 