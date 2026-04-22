import StudentApplication from "../../models/studentApplication.js";
import multer from "multer";
import path from "path";
import fs from "fs";


const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, "uploads/studentApplications");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const uploadUpdatePDF = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  }
});


export const UpdateStudentApplication = async (req, res) => {
   try {
    const { courses, reason } = req.body

    const application = await StudentApplication.findOne({
      user: req.user._id
    })

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      })
    }

    // Only allowed updates
    if (courses) {
      application.courses =
        typeof courses === "string" ? JSON.parse(courses) : courses

      application.totalFine = application.courses.length * 2000
    }

    if (reason) application.reason = reason

    // Attachment replace
    if (req.file) {
      if (application.attachment && fs.existsSync(application.attachment)) {
        fs.unlinkSync(application.attachment)
      }
      application.attachment = req.file.path
    }

    await application.save()

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      application
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}
    
    