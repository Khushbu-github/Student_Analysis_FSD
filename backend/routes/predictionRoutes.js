import express from "express";
import { predictPerformance } from "../controllers/predictionController.js";

const router = express.Router();

router.post("/predict", predictPerformance);

export default router;