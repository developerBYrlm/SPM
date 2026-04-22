import Student from "../models/student.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";



// read acad from DB
const getAcads = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        match: { role: "ACAD" }, 
        select: "name email userID profileImage role ",
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
      error: "Get ACAD server error",
    });
  }
};

// read single ACAD member from DB
const getAcad = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "user",
      match: { role: "ACAD" },
      select: "name email userID profileImage role department",
    });

    if (!student || !student.user) {
      return res.status(405).json({
        success: false,
        error: "ACAD not found",
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
      error: "Get ACAD server error",
    });
  }
};

// remove ACAD from DB
const removeAcad = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "ACAD not found"
      });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "ACAD removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export {  getAcads, getAcad, removeAcad };
