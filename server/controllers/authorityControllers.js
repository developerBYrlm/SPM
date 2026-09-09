import Student from "../models/student.js"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path from "path"
  


// read single Authority from DB
const getAuthoritys = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        match: { role: "authority" },
        select: "name email userID profileImage role department",
      });

    const filteredStudents = students.filter((s) => s.user !== null);

    return res.status(200).json({
      success: true,
      students: filteredStudents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Get authority server error",
    });
  }
};

// read single Authority member member from DB
const getAuthority = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "user",
      match: { role: "authority" },
      select: "name email userID profileImage role department",
    });

    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        error: "Authority not found",
      });
    }

    return res.status(200).json({
      success: true,
      student,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Get Authority server error",
    });
  }
};
// remove Authority from DB
const removeAuthority = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Authority not found"
      });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Authority removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export { getAuthority, getAuthoritys, removeAuthority };
