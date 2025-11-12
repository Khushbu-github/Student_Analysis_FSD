import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

// Register new student
export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, semester } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists with this email or roll number" });
    }

    // Create new student
    const student = await Student.create({
      name,
      email,
      password,
      rollNumber,
      department,
      semester
    });

    res.status(201).json({ 
      message: "Student registered successfully", 
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Registration error", error: error.message });
  }
};

// Login student
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        department: student.department,
        semester: student.semester
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error", error: error.message });
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};