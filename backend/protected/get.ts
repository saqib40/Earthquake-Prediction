import { Response } from "express";
import userModel from "../models/user";
import { CustomRequest } from "./auth";

/**
 * Controller to fetch all prediction data associated with the authenticated user.
 */
export default async function getAllPredictions(req: CustomRequest, res: Response): Promise<Response> {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID not found in token." });
        }

        // Find the user by ID and populate the 'data' field with the actual prediction documents
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
                dataArray: userWithData.data,
                username: userWithData.username,
            },
            message: "User data retrieved successfully.",
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving user data.",
        });
    }
}
