import Student from "../models/Student.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

 

 

// read facultys from DB
const getFacultys = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        match: { role: "faculty" }, 
        select: "name email userID profileImage role department",
      });

    const filteredStudents = students.filter((s) => s.user !== null);

    return res.status(200).json({
      success: true,
      students: filteredStudents,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Get faculty server error",
    });
  }
};


// read single faculty member member from DB
const getFaculty = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "user",
      match: { role: "faculty" },
      select: "name email userID profileImage role department",
    });

    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        error: "Faculty not found",
      });
    }

    return res.status(200).json({
      success: true,
      student: student,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Get Faculty server error", 
    });
  }
};

// remove faculty from DB
const removeFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Faculty not found"
      });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Faculty removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



export {  getFacultys, getFaculty, removeFaculty };
