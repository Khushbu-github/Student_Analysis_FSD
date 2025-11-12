import express from "express";
import { addPerformance, getStudentPerformance, getAllPerformances } from "../controllers/performanceController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/add", protect, addPerformance);
router.get("/:studentId", protect, getStudentPerformance);
router.get("/", protect, getAllPerformances);

export default router;