import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: false
  },
  modelVersion: { 
    type: String, 
    default: "v1.0" 
  },
  inputData: {
    attendance: { 
      type: Number, 
      required: true 
    },
    assignmentScore: { 
      type: Number, 
      required: true 
    },
    internalMarks: { 
      type: Number, 
      required: true 
    },
    projectMarks: { 
      type: Number, 
      required: true 
    },
    finalExamMarks: { 
      type: Number, 
      required: true 
    }
  },
  predictedGrade: { 
    type: String, 
    required: true 
  },
  confidenceScore: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Prediction", predictionSchema);