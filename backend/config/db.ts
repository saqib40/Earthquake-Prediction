import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const dbURL = process.env.DATABASE_URL as string;

const dbConnect = () => {
    mongoose.connect(dbURL)
    .then(() => {
        console.log("Connection Succesfull");
    })
    .catch((error) => {
        console.log("Issue in DB conection");
        console.error(error);
        process.exit(1);
    })
}

export default dbConnect;