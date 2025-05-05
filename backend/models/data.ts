import mongoose, { Document, Schema, Model } from "mongoose";

interface dataDoc extends Document {
    latitude: number;
    longitude: number;
    predictionDate: Date;
    user: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    predictionResult: string;
}

const dataSchema = new Schema<dataDoc>({
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    predictionDate: {
        type: Date,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    createdAt : {
        type: Date,
        default: Date.now,
    },
    predictionResult : {
        type: String,
        required: true
    }
});

const dataModel: Model<dataDoc> = mongoose.model<dataDoc>("Data", dataSchema);

export default dataModel;