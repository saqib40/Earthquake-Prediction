import { Request, Response } from "express";
import dataModel from "../models/data";
import axios from "axios";
import { ObjectId } from "mongoose";


interface CustomRequest extends Request {
    user?: {
        id: string | ObjectId;
    };
}

interface PredictionResponse {
    prediction: string;
}

interface PredictionRequestBody {
    latitude: number;
    longitude: number;
    predictionDate: Date; // string rakhu??? maybe idk for now
}

export default async function predictAndSave(req: CustomRequest, res: Response) : Promise<Response> {
    try {
        // expecting {latitude, longitude and date} in the request body
        const { latitude, longitude, predictionDate }: PredictionRequestBody = req.body;
        const userId = req.user?.id;
        // Basic i/p validation
        if (!latitude || !longitude || !predictionDate) {
            return res.status(400).json({
                success: false,
                message: "Latitude, longitude, and predictionDate are required.",
            });
        }
        // use axios to send it to flaskEndPoint
        const flaskEndpoint = process.env.FLASK_ENDPOINT;
        const flaskRequestData = {
            latitude,
            longitude,
            predictionDate,
        };
        const response = await axios.post<PredictionResponse>(flaskEndpoint as string, flaskRequestData);
        // it will make a prediction
        const predictionResult = response.data.prediction;
        // then we will save it to the DB
        const newData = new dataModel({
            latitude,
            longitude,
            predictionDate,
            user: userId, // Use the user ID from req.user
            predictionResult,
        });
        const savedData = await newData.save();
        return res.status(201).json({ // 201 for successful resource creation
            success: true,
            data: savedData,
            message: "Prediction saved successfully.",
        });
    } catch(error) {
        console.error("Error during prediction and save:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to predict and save."
        });
    }
}