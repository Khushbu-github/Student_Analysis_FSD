import mongoose from "mongoose";

const performanceSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  attendance: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  assignmentScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  internalMarks: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  projectMarks: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  finalExamMarks: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  predictedGrade: { 
    type: String 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Performance", performanceSchema);