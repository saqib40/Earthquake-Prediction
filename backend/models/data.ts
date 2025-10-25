import mongoose, { Document, Schema, Model } from "mongoose";

interface DataDoc extends Document {
    user: mongoose.Schema.Types.ObjectId;
    // Fields for original prediction
    input?: { // Make original input optional
        latitude: number;
        longitude: number;
        depth: number;
        stations: number;
    };
    regression?: Record<string, number>; // Optional
    classification?: Record<string, string>; // Optional
    // Fields for LSTM prediction
    lstmInputDepth?: number; // Optional input depth for LSTM
    lstmNextMagnitude?: number; // Optional predicted next magnitude
    lstmFutureMagnitudes?: number[]; // Optional array of future predictions
    createdAt: Date;
}

const dataSchema = new Schema<DataDoc>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    input: {
        latitude: { type: Number },
        longitude: { type: Number },
        depth: { type: Number },
        stations: { type: Number },
    },
    regression: { type: Map, of: Number },
    classification: { type: Map, of: String },
    lstmInputDepth: { type: Number },
    lstmNextMagnitude: { type: Number },
    lstmFutureMagnitudes: { type: [Number] }, // Store array of numbers
}, { timestamps: { createdAt: true, updatedAt: false } }); // Use timestamps for createdAt

const dataModel: Model<DataDoc> = mongoose.model<DataDoc>("Data", dataSchema);

export default dataModel;

