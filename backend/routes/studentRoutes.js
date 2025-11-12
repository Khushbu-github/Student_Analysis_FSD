import express from "express";
import { registerStudent, loginStudent, getStudentProfile } from "../controllers/studentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/profile", protect, getStudentProfile);

export default router;