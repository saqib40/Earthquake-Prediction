import mongoose, { Document, Schema, Model } from "mongoose";

// Interface describing the properties of a User document
interface UserDoc extends Document {
    username: string;
    password: string;
    email: string;
    data: mongoose.Schema.Types.ObjectId[]; // Array of references to Data documents
}

const userSchema = new Schema<UserDoc>({
    username: {
        type: String,
        trim: true,
        required: [true, "Username is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email is required"],
        unique: true, // Ensures each email is unique in the database
        lowercase: true,
    },
    data: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Data", // This establishes the link to the Data model
        }
    ]
}, { timestamps: true }); // Automatically add createdAt and updatedAt fields

const userModel: Model<UserDoc> = mongoose.model<UserDoc>("Users", userSchema);

export default userModel;
