import { Request, Response } from "express";
import userModel from "../models/user";
import { ObjectId } from "mongoose";

interface CustomRequest extends Request {
    user?: {
        email: string;
        id: string | ObjectId;
    };
}

export default async function getEverything(req: CustomRequest, res: Response) : Promise<Response> {
    try {
        const userId = req.user?.id;
        const userWithData = await userModel.findById(userId).populate("data");
        if (!userWithData) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                dataArray : userWithData.data,
                username : userWithData.username
            }, //'data' array
            message: "User data retrieved successfully.",
        });
    } catch(error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user data."
        });
    }
}