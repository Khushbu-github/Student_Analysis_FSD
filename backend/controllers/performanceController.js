// controllers/performanceController.js - FIXED VERSION
import Performance from "../models/Performance.js";

// Add performance data
export const addPerformance = async (req, res) => {
  try {
    const { 
      studentId, 
      subject, 
      attendance, 
      assignmentScore, 
      internalMarks, 
      projectMarks, 
      finalExamMarks 
    } = req.body;

    // Simple prediction without TensorFlow.js
    const calculateGrade = (attendance, assignment, internal, project, finalExam) => {
      // Weighted average calculation
      const weightedScore = 
        (attendance * 0.15) + 
        (assignment * 0.20) + 
        (internal * 0.25) + 
        (project * 0.15) + 
        (finalExam * 0.25);
      
      if (weightedScore >= 85) return "A";
      if (weightedScore >= 70) return "B";
      if (weightedScore >= 55) return "C";
      if (weightedScore >= 40) return "D";
      return "F";
    };

    const predictedGrade = calculateGrade(
      attendance, 
      assignmentScore, 
      internalMarks, 
      projectMarks, 
      finalExamMarks
    );

    // Save performance
    const performance = await Performance.create({
      studentId,
      subject,
      attendance,
      assignmentScore,
      internalMarks,
      projectMarks,
      finalExamMarks,
      predictedGrade
    });

    res.status(201).json({ 
      message: "Performance data added successfully", 
      performance 
    });
  } catch (error) {
    console.error("Error adding performance:", error);
    res.status(500).json({ 
      message: "Error adding performance data", 
      error: error.message 
    });
  }
};

// Get student performance records
export const getStudentPerformance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const performances = await Performance.find({ studentId })
      .populate("studentId", "name rollNumber")
      .sort({ createdAt: -1 });
    res.json(performances);
  } catch (error) {
    console.error("Error fetching performance:", error);
    res.status(500).json({ 
      message: "Error fetching performance data", 
      error: error.message 
    });
  }
};

// Get all performances (admin)
export const getAllPerformances = async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate("studentId", "name rollNumber department semester")
      .sort({ createdAt: -1 });
    res.json(performances);
  } catch (error) {
    console.error("Error fetching performances:", error);
    res.status(500).json({ 
      message: "Error fetching performances", 
      error: error.message 
    });
  }
};