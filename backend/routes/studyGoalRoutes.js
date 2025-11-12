import express from "express";
import { getGoals, createGoal, updateGoal, deleteGoal, generateStudyPlan } from "../controllers/studyGoalController.js";

const router = express.Router();

router.get("/:studentId", getGoals);
router.post("/add", createGoal);
router.post("/generate", generateStudyPlan);
router.put("/update/:id", updateGoal);
router.delete("/delete/:id", deleteGoal);

export default router;
