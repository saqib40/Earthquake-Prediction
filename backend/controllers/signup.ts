import { Request, Response } from "express";
import userModel from "../models/user";
import bcrypt from "bcrypt";

export default async function signup(req: Request, res: Response) : Promise<Response> {
    try {
        // get user data
        const { username, email, password } = req.body;
        // check for registered user
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        // Secure the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // create entry in db
        await userModel.create({
            username,
            email,
            password: hashedPassword,
        });
        return res.status(200).json({
            success: true,
            message: "User created successfully",
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered, please try again later",
        });
    }
}