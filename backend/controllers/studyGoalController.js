import StudyGoal from "../models/StudyGoal.js";
import Performance from "../models/Performance.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Get all goals for a student
export const getGoals = async (req, res) => {
  try {
    const goals = await StudyGoal.find({ studentId: req.params.studentId }).sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  const { studentId, subject, topic, deadline, priority } = req.body;

  try {
    const newGoal = new StudyGoal({
      studentId,
      subject,
      topic,
      deadline,
      priority
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a goal (status or details)
export const updateGoal = async (req, res) => {
  try {
    const updatedGoal = await StudyGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedGoal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    await StudyGoal.findByIdAndDelete(req.params.id);
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate AI Study Plan
export const generateStudyPlan = async (req, res) => {
  const { studentId } = req.body;
  let weakSubjects = [];

  try {
    // 1. Fetch student performance to identify weak areas
    const performances = await Performance.find({ studentId });
    console.log(`Fetched ${performances.length} performance records for student ${studentId}`);
    
    // Calculate average score per subject
    const subjectPerformance = {};
    performances.forEach(p => {
      if (!subjectPerformance[p.subject]) {
        subjectPerformance[p.subject] = { total: 0, count: 0 };
      }
      subjectPerformance[p.subject].total += p.finalExamMarks;
      subjectPerformance[p.subject].count += 1;
    });

    weakSubjects = Object.keys(subjectPerformance)
      .map(subject => ({
        subject,
        avg: subjectPerformance[subject].total / subjectPerformance[subject].count
      }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3) // Focus on top 3 weakest subjects
      .map(s => s.subject);

    if (weakSubjects.length === 0) {
       return res.status(400).json({ message: "Not enough performance data to generate a plan." });
    }

    // 2. Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      Create a study plan for a student who is weak in the following subjects: ${weakSubjects.join(", ")}.
      Generate 5 specific, actionable study goals.
      
      Output strictly in JSON format as an array of objects with this structure:
      [
        {
          "subject": "Subject Name",
          "topic": "Specific Topic to Study",
          "deadline": "YYYY-MM-DD" (calculate dates starting from tomorrow, spread over next 2 weeks),
          "priority": "high" or "medium"
        }
      ]
      Do not include any markdown formatting or explanation. Just the JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("Raw AI Response:", text); // Debug log
    
    let aiGoals;
    try {
        aiGoals = JSON.parse(text);
    } catch (parseError) {
        console.error("JSON Parse Failed. Raw Text:", text);
        throw new Error("Failed to parse AI response. Try again.");
    }

    // 3. Save goals to database
    const savedGoals = await Promise.all(aiGoals.map(async (goal) => {
      const newGoal = new StudyGoal({
        studentId,
        subject: goal.subject,
        topic: goal.topic,
        deadline: new Date(goal.deadline),
        priority: goal.priority,
        status: 'pending'
      });
      return await newGoal.save();
    }));

    res.status(201).json(savedGoals);

  } catch (error) {
    console.error("AI Generation Error:", error);
    
    // FALLBACK LOGIC
    if (error.status === 429 || error.status === 503 || error.message.includes('429')) {
        console.log("Rate limit hit. Generating fallback goals.");
        
        const fallbackGoals = weakSubjects.map(subject => ({
            studentId,
            subject: subject,
            topic: `Review core concepts of ${subject}`,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
            priority: "medium",
            status: "pending"
        }));

        // Add a second goal for the weakest subject
        if (weakSubjects.length > 0) {
            fallbackGoals.push({
                studentId,
                subject: weakSubjects[0],
                topic: `Practice past papers for ${weakSubjects[0]}`,
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                priority: "high",
                status: "pending"
            });
        }

        try {
            const savedFallbackGoals = await Promise.all(fallbackGoals.map(async (goal) => {
                const newGoal = new StudyGoal(goal);
                return await newGoal.save();
            }));
            return res.status(201).json(savedFallbackGoals);
        } catch (dbError) {
             console.error("Fallback DB Error - Failed to save goals:", dbError);
             return res.status(500).json({ message: "Failed to generate AI plan and fallback failed.", error: dbError.message });
        }
    }

    if (error.response) {
        console.error("AI Response Error Details:", JSON.stringify(error.response, null, 2));
    }
    res.status(500).json({ message: "Failed to generate study plan. Server logs have more details.", error: error.message });
  }
};
