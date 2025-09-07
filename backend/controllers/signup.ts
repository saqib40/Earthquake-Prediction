import { Request, Response } from "express";
import userModel from "../models/user";
import bcrypt from "bcrypt";

export default async function signup(req: Request, res: Response): Promise<Response> {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: "Username, email, and password are required." });
        }

        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ // 409 Conflict is more appropriate here
                success: false,
                message: "An account with this email already exists.",
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await userModel.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        return res.status(201).json({ // 201 Created
            success: true,
            message: "User registered successfully. Please log in.",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error during registration.",
        });
    }
}
