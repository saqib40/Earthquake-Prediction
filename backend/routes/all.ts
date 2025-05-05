// Note
// there were some persistant issues in this file with the latest versions of express and @types/express
// which got fixed after downgrading the express and @types/express
// they might fix it in future
// for the time being
/*
to make it work
npm uninstall express @types/express 
npm install express@4.18.2
npm install @types/express@4.17.17
rm -rf node_modules && npm install
*/

import express from "express";

import login from "../controllers/login";
import signup from "../controllers/signup";

import auth from "../protected/auth";
import getEverything from "../protected/get";
import predictAndSave from "../protected/predict_save";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/all", auth, getEverything);
router.post("/predict", auth, predictAndSave);

export default router;