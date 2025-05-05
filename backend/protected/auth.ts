import { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

// Extend the Request interface to include the 'user' property
interface CustomRequest extends Request {
    user?: any; 
}

export default async function auth(req: CustomRequest, res: Response, next : NextFunction): Promise<Response | void> {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({
                success:false,
                message:"Token missing",
            });
        }

        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success:false,
                message:"Token missing",
            });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        const isTokenExpired = decoded.exp < Date.now() / 1000;
        if (isTokenExpired) {
            return res.status(401).json({
                success: false,
                message: "Token has expired",
            });
        }
        req.user = decoded;
        next();
    } catch(error) {
        return res.status(401).json({
            success: false,
            message: "Something went wrong while verifying the user",
        });
    }
}