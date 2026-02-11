import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import studentRoutes from "./routes/studentRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import studyGoalRoutes from "./routes/studyGoalRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/students", studentRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/prediction", predictionRoutes);
app.use("/api/study-goals", studyGoalRoutes);

app.get("/", (req, res) => res.send("Student Performance AI API Running ✅"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;

// ✅ Start server ONLY after DB connects
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
