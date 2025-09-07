import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Express Request interface to include our custom 'user' property
export interface CustomRequest extends Request {
    user?: {
        email: string;
        id: string;
    }; 
}

/**
 * Middleware to authenticate requests using a JWT token.
 * It verifies the token from the Authorization header and attaches the decoded user payload to the request object.
 */
export default function auth(req: CustomRequest, res: Response, next: NextFunction): Response | void {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is missing. Access denied.",
            });
        }

        const token = authHeader.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing from header. Access denied.",
            });
        }

        // Verify the token. This will automatically throw an error if it's invalid or expired.
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string; id: string; };
        
        // Attach the decoded user information to the request object
        req.user = decoded;
        
        next(); // Proceed to the next middleware or controller
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please log in again.",
        });
    }
}
