import User from "../models/User.js";
import Student from "../models/student.js";
import bcrypt from "bcrypt";

// Get all IT members
const getITUsers = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        match: { role: "IT" }, 
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
      error: "Get IT server error",
    });
  }
};


// Get single IT member
const getITUser = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "user",
      match: { role: "IT" },
      select: "name email userID profileImage role department",
    });

    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        error: "IT member not found"
      });
    }

    return res.status(200).json({
      success: true,
      student
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Get IT server error",
    });
  }
};

// Delete IT member
const removeITUser = async (req, res) => {
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

export {
  getITUsers,
  getITUser,
  removeITUser
};