import { Request, Response } from "express";
import userModel from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const login = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const payload = {
            email: user.email,
            id: user._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "24h", // Token valid for 24 hours
        });

        return res.status(200).json({
            success: true,
            token,
            message: "Login successful.",
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Server error during login." });
    }
}

export default login;
