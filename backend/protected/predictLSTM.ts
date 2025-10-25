import { Response } from "express";
import dataModel from "../models/data";
import userModel from "../models/user";
import axios from "axios";
import { CustomRequest } from "./auth";

interface LSTMPredictionRequestBody {
    depth: number;
    future_steps?: number; // Make optional on backend input as well
}

interface FlaskLSTMResponse {
    next_magnitude: number;
    future_magnitudes: number[];
}

export default async function predictLSTM(req: CustomRequest, res: Response): Promise<Response> {
    try {
        const { depth, future_steps }: LSTMPredictionRequestBody = req.body; // Receive optional steps
        const userId = req.user?.id;

        if (userId === undefined || depth === undefined) {
            return res.status(400).json({ success: false, message: "Missing required field: depth." });
        }
         // Validate future_steps if provided
         if (future_steps !== undefined && (typeof future_steps !== 'number' || future_steps <= 0)) {
            return res.status(400).json({ success: false, message: "Optional field 'future_steps' must be a positive number." });
        }

        const flaskLstmEndpoint = process.env.FLASK_LSTM_ENDPOINT;
        if (!flaskLstmEndpoint) {
            throw new Error("FLASK_LSTM_ENDPOINT environment variable is not set.");
        }

        const axiosConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Node.js/Axios'
            }
        };

        // Pass future_steps to Flask if it was provided
        const flaskPayload: any = { depth };
        if (future_steps !== undefined) {
            flaskPayload.future_steps = future_steps;
        }

        const response = await axios.post<FlaskLSTMResponse>(flaskLstmEndpoint, flaskPayload, axiosConfig);
        const predictionResult = response.data;

        const newPrediction = new dataModel({
            user: userId,
            lstmInputDepth: depth,
            lstmNextMagnitude: predictionResult.next_magnitude,
            lstmFutureMagnitudes: predictionResult.future_magnitudes,
        });
        const savedData = await newPrediction.save();

        await userModel.findByIdAndUpdate(userId, { $push: { data: savedData._id } });

        return res.status(201).json({
            success: true,
            data: savedData,
            message: "LSTM Prediction successful and data saved.",
        });

    } catch (error: any) {
        if (error.isAxiosError) {
            console.error("Axios error during LSTM prediction:", error.response?.data || error.message);
             return res.status(error.response?.status || 500).json({
                success: false,
                message: error.response?.data?.error || "Prediction service error.",
            });
        } else {
            console.error("Error during LSTM prediction and save:", error.message);
        }
        return res.status(500).json({ success: false, message: "An internal server error occurred." });
    }
}
