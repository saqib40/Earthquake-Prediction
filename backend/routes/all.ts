import express from "express";
import login from "../controllers/login";
import signup from "../controllers/signup";
import auth from "../protected/auth";
import getAllPredictions from "../protected/get";
import predictAndSave from "../protected/predict_save";
import predictLSTM from "../protected/predictLSTM"; // Import new controller

const router = express.Router();

// --- Authentication Routes ---
router.post("/login", login);
router.post("/signup", signup);

// --- Protected Data Routes (require authentication) ---
router.get("/predictions", auth, getAllPredictions); // Renamed for clarity
router.post("/predict", auth, predictAndSave);
router.post("/predict-lstm", auth, predictLSTM); // Add new route

export default router;
