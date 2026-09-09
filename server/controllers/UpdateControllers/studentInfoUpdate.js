import Student from "../../models/student.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path from "path" 

// update student into DB 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imageUploads/uploads")   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const uploadUpdate = multer({ storage })

const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      password,
      phone
    } = req.body;

    const { id } = req.params;

    const student = await Student.findById(id).populate(
      "user"
    );

    if (!student || !student.user) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    if (
      student.user.role?.toLowerCase() !==
      "student"
    ) {
      return res.status(403).json({
        success: false,
        error: "This profile is not a student profile"
      });
    }

    if (email && email !== student.user.email) {
      const emailExists = await student.user.constructor.findOne({
        email,
        _id: {
          $ne: student.user._id
        }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: "Email already exists"
        });
      }

      student.user.email = email;
    }

    if (
      studentId &&
      studentId !== student.studentId
    ) {
      const studentIdExists = await Student.findOne({
        studentId,
        _id: {
          $ne: student._id
        }
      });

      if (studentIdExists) {
        return res.status(409).json({
          success: false,
          error: "Student ID already exists"
        });
      }

      student.user.userID = studentId;
      student.studentId = studentId;
    }

    if (name) {
      student.user.name = name;
    }

    if (password) {
      student.user.password = await bcrypt.hash(
        password,
        10
      );
    }

    if (req.file) {
      student.user.profileImage =
        req.file.filename;
    }

    if (phone) {
      student.phone = phone;
    }

    await student.user.save();
    await student.save();

    return res.status(200).json({
      success: true,
      message:
        "Student information updated successfully",
      student
    });
  } catch (error) {
    console.error(
      "Update student error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


export {updateStudent, uploadUpdate};