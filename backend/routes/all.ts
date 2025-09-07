import express from "express";
import login from "../controllers/login";
import signup from "../controllers/signup";
import auth from "../protected/auth";
import getAllPredictions from "../protected/get";
import predictAndSave from "../protected/predict_save";

const router = express.Router();

// --- Authentication Routes ---
router.post("/login", login);
router.post("/signup", signup);

// --- Protected Data Routes (require authentication) ---
router.get("/predictions", auth, getAllPredictions);
router.post("/predict", auth, predictAndSave);

export default router;
