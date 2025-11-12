
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const run = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log("Testing gemini-2.0-flash with suggestions prompt...");

    const prompt = `
        Act as an academic performance analyzer.
        Input Data:
        - Attendance: 80%
        - Assignment Score: 70%
        - Internal Marks: 60%
        - Project Marks: 75%
        - Final Exam Marks: 65%
        
        Provide the output purely in valid JSON format. Structure:
        {
          "predictedGrade": "Grade",
          "confidence": Number,
          "predictedValue": Number,
          "suggestions": ["S1", "S2"]
        }
      `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw Response:", text);
    
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);
    
    if (data.suggestions && Array.isArray(data.suggestions)) {
        console.log("SUCCESS: Suggestions received:", data.suggestions);
    } else {
        console.log("WARNING: Suggestions missing or invalid format.");
    }

  } catch (error) {
    console.error("ERROR:", error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
    }
    process.exit(1);
  }
};

run();
