import mongoose, {Document, Schema, Model} from "mongoose";

interface userDoc extends Document {
    username: string,
    password: string,
    email : string,
    data : mongoose.Schema.Types.ObjectId,
}

const userSchema = new Schema<userDoc>({
    username: {
        type: String,
        trim: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
    },
    data: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Data",
        }
    ]
});

const userModel: Model<userDoc> = mongoose.model<userDoc>("Users", userSchema);

export default userModel;