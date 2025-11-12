// controllers/predictionController.js - UPDATED WITH GEMINI AI
import Prediction from "../models/Performance.js"; // Corrected import to match filename
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export const predictPerformance = async (req, res) => {
  try {
    const { 
      studentId,
      attendance, 
      assignmentScore, 
      internalMarks, 
      projectMarks, 
      finalExamMarks 
    } = req.body;

    // Validate required fields
    if (attendance === undefined || assignmentScore === undefined || internalMarks === undefined || projectMarks === undefined || finalExamMarks === undefined) {
      return res.status(400).json({ 
        message: "All performance fields are required" 
      });
    }

    let predictionResult = {
      grade: "F",
      confidence: 0,
      score: 0,
      suggestions: []
    };

    try {
      // Use Gemini AI for prediction - Upgrade to gemini-2.0-flash
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Act as an academic performance analyzer. Based on the following student marks, predict their final grade (A, B, C, D, or F), a confidence score (0-100), a weighted average score (0-100), and provide 3 specific, actionable suggestions for improvement.
        
        Input Data:
        - Attendance: ${attendance}%
        - Assignment Score: ${assignmentScore}%
        - Internal Marks: ${internalMarks}%
        - Project Marks: ${projectMarks}%
        - Final Exam Marks: ${finalExamMarks}%
        
        Provide the output purely in valid JSON format with no markdown or additional text. Structure:
        {
          "predictedGrade": "Grade",
          "confidence": Number,
          "predictedValue": Number,
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up markdown code blocks if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(jsonStr);

      predictionResult = {
        grade: aiData.predictedGrade,
        confidence: aiData.confidence,
        score: aiData.predictedValue,
        suggestions: aiData.suggestions || []
      };

    } catch (aiError) {
      console.error("Gemini AI Error, falling back to algorithm:", aiError.message);
      
      // Fallback Algorithm
      const weightedScore = 
        (Number(attendance) * 0.15) + 
        (Number(assignmentScore) * 0.20) + 
        (Number(internalMarks) * 0.25) + 
        (Number(projectMarks) * 0.15) + 
        (Number(finalExamMarks) * 0.25);
      
      let grade = "F";
      if (weightedScore >= 85) grade = "A";
      else if (weightedScore >= 70) grade = "B";
      else if (weightedScore >= 55) grade = "C";
      else if (weightedScore >= 40) grade = "D";
      
      // Generate generic suggestions based on lowest scores
      const suggestions = [];
      if (Number(attendance) < 75) suggestions.push("Improve attendance to ensure better engagement.");
      if (Number(assignmentScore) < 70) suggestions.push("Focus on submitting higher quality assignments.");
      if (Number(internalMarks) < 60) suggestions.push("Prepare better for internal assessments.");
      if (Number(projectMarks) < 60) suggestions.push("Put more effort into practical projects.");
      if (suggestions.length === 0) suggestions.push("Keep up the good work! Aim for consistency.");

      predictionResult = {
        grade,
        score: weightedScore,
        confidence: 85, // Fallback confidence
        suggestions: suggestions.slice(0, 3)
      };
    }
    
    // Save prediction
    const predictionData = {
      studentId: studentId || null, 
      subject: "General Performance", // Default subject
      attendance, 
      assignmentScore, 
      internalMarks, 
      projectMarks, 
      finalExamMarks,
      predictedGrade: predictionResult.grade,
      // Note: If you want to save suggestions to DB, you need to update the Schema first.
      // For now we just return them to frontend.
    };

    // Note: The Performance model might require 'subject' and 'predictedGrade' to be saved.
    // The previous controller had some discrepancies with the model schema.
    // I've added a default subject and mapped fields correctly.
    
    // Check if we need to save to DB (optional based on user flow, but kept for consistency)
    if (studentId) {
        await Prediction.create(predictionData);
    }
    
    res.json({ 
      predictedGrade: predictionResult.grade, 
      confidence: predictionResult.confidence, 
      predictedValue: predictionResult.score,
      suggestions: predictionResult.suggestions,
      message: "Prediction generated successfully"
    });
    
  } catch (err) {
    console.error("Critical Server Error during prediction:", err);
    res.status(500).json({ 
      message: "Server error during prediction", 
      error: err.message 
    });
  }
};