import mongoose, { Document, Schema, Model } from "mongoose";

interface DataDoc extends Document {
    user: mongoose.Schema.Types.ObjectId;
    input: {
        latitude: number;
        longitude: number;
        depth: number;
        stations: number;
    };
    regression: Record<string, number>;
    classification: Record<string, string>;
    createdAt: Date;
}

const dataSchema = new Schema<DataDoc>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to the user who made the prediction
        required: true,
    },
    input: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        depth: { type: Number, required: true },
        stations: { type: Number, required: true },
    },
    // Stores the full regression results object from the Python model
    regression: {
        type: Map,
        of: Number,
        required: true,
    },
    // Stores the full classification results object from the Python model
    classification: {
        type: Map,
        of: String,
        required: true,
    },
}, { timestamps: { createdAt: true, updatedAt: false } }); // Only add createdAt

const dataModel: Model<DataDoc> = mongoose.model<DataDoc>("Data", dataSchema);

export default dataModel;
