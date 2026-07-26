import Student from "../models/Student.js"
import User from "../models/User.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path from "path"
  


// read single Authority from DB
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
      student: student,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: "Get authority server error", 
    });
  }
};



export { getAuthority };
