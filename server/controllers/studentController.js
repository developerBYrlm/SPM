import Student from "../models/student.js" 
import User from "../models/User.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path from "path"
  
// add student,faculty,authority,acad into DB 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imageUploads/uploads")   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage })

const addStudent = async (req, res) => {
  try {
    const { name, email, studentId, gender, role, department, password, phone } = req.body

    if (!name || !email || !studentId || !gender || !role || !department || !password || !phone) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      })
    }

    const userExist = await User.findOne({ email })
    if (userExist) {
      return res.status(400).json({ success: false, error: "User already exists" })
    }

    const studentExist = await Student.findOne({ studentId })
    if (studentExist) {
      return res.status(400).json({ success: false, error: "User ID already exists" })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role,
      department,
      profileImage: req.file ? req.file.filename : "",
      userID: studentId
    })

    await Student.create({
      user: newUser._id,
      studentId,
      gender,
      phone
    })

    res.status(201).json({
      success: true,
      message: "Account created successfully"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// read all students from DB
const getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate({
        path: "user",
        match: { role: "student" }, 
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
      error: "Get student server error",
    });
  } 
};

// read single student from DB
const getStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await Student.findById(id).populate({
      path: "user",
      match: { role: "student" },
      select: "name email userID profileImage role department",
    }); 

    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
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
      error: "Get student server error",
    });
  }
};

// remove student from DB
const removeStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Student removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export { addStudent, upload, getStudents, getStudent, removeStudent };
