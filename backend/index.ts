import express, { Express } from "express";
import dotenv from "dotenv";
import router from "./routes/all";
import bodyParser from 'body-parser';
import dbConnect from "./config/db";
import cors from "cors";

// Load environment variables from .env file
dotenv.config();

const app: Express = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({ optionsSuccessStatus: 200 }));

// Parse incoming JSON requests
app.use(bodyParser.json());

// Set the port, defaulting to 4000 if not specified in .env
const port: number = parseInt(process.env.PORT || "4000");

// Mount the main router for all API version 1 routes
app.use("/v1", router);

// Establish the database connection
dbConnect();

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
