import { Response } from "express";
import dataModel from "../models/data";
import userModel from "../models/user";
import axios from "axios"; // Import axios
import { CustomRequest } from "./auth";

// Interfaces to type-check the incoming request and the microservice response
interface PredictionRequestBody {
    latitude: number;
    longitude: number;
    depth: number;
    stations: number;
}

interface FlaskResponse {
    Regression: Record<string, number>;
    Classification: Record<string, string>;
}

/**
 * Controller to handle a new prediction request.
 * 1. Validates input from the client.
 * 2. Calls the Python Flask microservice to get a prediction.
 * 3. Saves the input and the full prediction result to the database.
 * 4. Links the new prediction data to the user who made the request.
 */
export default async function predictAndSave(req: CustomRequest, res: Response): Promise<Response> {
    try {
        const { latitude, longitude, depth, stations }: PredictionRequestBody = req.body;
        const userId = req.user?.id;

        if (userId === undefined || latitude === undefined || longitude === undefined || depth === undefined || stations === undefined) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: latitude, longitude, depth, and stations.",
            });
        }

        const flaskEndpoint = process.env.FLASK_ENDPOINT;
        if (!flaskEndpoint) {
            throw new Error("FLASK_ENDPOINT environment variable is not set.");
        }
        
        // --- THE FIX IS HERE ---
        // We are making the axios request as unambiguous as possible by explicitly
        // setting all relevant headers to mimic a standard client like Insomnia.
        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Node.js/Axios' // A simple, non-browser user agent
            }
        };

        const response = await axios.post<FlaskResponse>(flaskEndpoint, { latitude, longitude, depth, stations }, axiosConfig);
        const predictionResult = response.data;

        const newPrediction = new dataModel({
            user: userId,
            input: { latitude, longitude, depth, stations },
            regression: predictionResult.Regression,
            classification: predictionResult.Classification,
        });
        const savedData = await newPrediction.save();

        await userModel.findByIdAndUpdate(userId, {
            $push: { data: savedData._id }
        });

        return res.status(201).json({
            success: true,
            data: savedData,
            message: "Prediction successful and data saved.",
        });

    } catch (error: any) {
        if (error.isAxiosError) {
            console.error("Axios error during prediction:", error.response?.data || error.message);
        } else {
            console.error("Error during prediction and save:", error.message);
        }
        
        return res.status(500).json({
            success: false,
            message: "An internal server error occurred while communicating with the prediction service.",
        });
    }
}