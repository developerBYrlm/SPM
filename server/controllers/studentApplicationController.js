import StudentApplication from "../models/studentApplication.js";
import User from "../models/User.js"
import multer from "multer";
import path from "path";
import fs from "fs";
 
// pdf upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => { 
    cb(null, "uploads/studentApplications");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  }
});


// apply student application
export const applyStudentApplication = async (req, res) => {
  try {
    const {
      missedExamType,
      missedExamDate,
      semester,
      section,
      department,
      reason,
      courses,
      totalFine
    } = req.body;

    const user = await User.findById(req.user.id);        

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const alreadyApplied = await StudentApplication.findOne({
      user: user._id
    });                                                  

    if (alreadyApplied)
      return res.status(400).json({
        success: true,
        message: "Application already submitted"
      });

    const application = new StudentApplication({
      user: user._id,                            
      studentId: user.userID,                           
      name: user.name, 
      missedExamType,
      missedExamDate,
      semester,
      section,
      department,
      reason,
      courses: JSON.parse(courses),
      totalFine,
      attachment: req.file ? req.file.path : null
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// get all applications from DB
export const getAllApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.find()
    .populate("user", "name userID email role department")  
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// get single application from DB
export const getApplicationById = async (req, res) => {
  try {
    const application = await StudentApplication.findById(req.params.id)
    .populate("user", "name userID email role department"); 

    if (!application)
      return res.status(404).json({ success: false, error: "Application not found" });

    res.status(200).json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//  remove single application from DB
export const removeApplication = async (req, res) => {
  try {
    const application = await StudentApplication.findById(req.params.id);
    if (!application)
      return res.status(404).json({ success: false, error: "Not found" });

    if (application.attachment && fs.existsSync(application.attachment)) {
      fs.unlinkSync(application.attachment);
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application removed successfully" 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// remove all applications from DB and delete attachments
export const removeAllApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.find();

    applications.forEach((application) => {
      if (application.attachment && fs.existsSync(application.attachment)) {
        fs.unlinkSync(application.attachment);
      }
    });

    await StudentApplication.deleteMany({});

    res.status(200).json({
      success: true,
      message: "All applications and their attachments removed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// get own application
export const getMyApplication = async (req, res) => {
  try {
    const application = await StudentApplication.findOne({ user: req.user._id }) // 🔹 only logged-in student
      .populate("user", "name userID email role department");

    if (!application)
      return res.status(404).json({ success: false, error: "Application not found" });

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await StudentApplication.findById(req.params.id);

    if (!application)
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });

    if (status === "approved_by_authority")
      application.authorityStatus = "Approved";

    if (status === "rejected_by_authority")
      application.authorityStatus = "Rejected";

    if (status === "approved_by_faculty")
      application.facultyStatus = "Approved";

    if (status === "rejected_by_faculty")
      application.facultyStatus = "Rejected";

    await application.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      application
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// consider amount
export const updateConsiderAmount = async (req, res) => {
  try {
    const { percentage } = req.body;

    const application = await StudentApplication.findById(req.params.id);

    if (!application)
      return res.status(404).json({
        success: false,
        message: "Application not found"
      }); 

    const originalFine = application.totalFine;
    const newFine = Math.round(originalFine * (percentage / 100));

    application.totalFine = newFine;

    await application.save();

    res.status(200).json({
      success: true,
      message: "Consider amount updated",
      application
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


