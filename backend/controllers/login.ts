import { Request, Response } from "express";
import userModel from "../models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req: Request, res: Response) : Promise<Response> => {
    try {
        // get user data
        const { email, password } = req.body;
        // check for registered user
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered",
            });
        }
        // verify password
        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Wrong Password",
            });
        }
        // generate a JWT token and send it to user
        const payload = {
            email: user.email,
            id: user._id,
        };
        let token = jwt.sign(payload, process.env.JWT_SECRET as string, {
            expiresIn: "2h",
        });
        return res.status(200).json({
            success: true,
            token,
            message: "User logged in successfully",
        });
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login failure",
        });
    }
}

export default login;