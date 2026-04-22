import Student from "../../models/student.js"
import User from "../../models/User.js"
import bcrypt from "bcrypt"
import multer from "multer"
import path from "path"

// update ACAD into DB 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "imageUploads/uploads")   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const uploadUpdate = multer({ storage })

const updateAcad = async (req, res) => {
  try {
    const { name, email, studentId, password, phone } = req.body
    const { id } = req.params

    const student = await Student.findById(id).populate("user")
    if (!student) {
      return res.status(404).json({ success: false, error: "ACAD not found" })
    }
 
    if (name) student.user.name = name
    if (email) student.user.email = email
    if (studentId) {
      student.user.userID = studentId
      student.studentId = studentId
    }

    if (password) {
      const hashPassword = await bcrypt.hash(password, 10)
      student.user.password = hashPassword
    }

    if (req.file) {
      student.user.profileImage = req.file.filename
    }

    await student.user.save()


    if (phone) student.phone = phone
    await student.save()

    res.status(200).json({
      success: true,
      message: "ACAD info updated successfully"
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}


export {updateAcad, uploadUpdate};