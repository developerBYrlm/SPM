import StudentApplication from "../../models/StudentApplication.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Set PDF upload location and file name
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/studentApplications"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

// Allow only PDF files
export const uploadUpdatePDF = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"));
  }
});

// Create faculty status list and keep old status
const buildUpdatedFacultyStatuses = (courses, oldFacultyStatuses = []) => {
  const uniqueFacultyAcronyms = [
    ...new Set(
      courses
        .map((course) => course.facultyAcr?.trim().toUpperCase())
        .filter(Boolean)
    )
  ];

  return uniqueFacultyAcronyms.map((acr) => {
    const oldStatus = oldFacultyStatuses.find(
      (item) => item.facultyAcr?.trim().toUpperCase() === acr
    );

    return {
      facultyAcr: acr,
      status: oldStatus?.status || "Pending"
    };
  });
};

// Update student application
export const UpdateStudentApplication = async (req, res) => {
  try {
    const { courses, reason, totalFine } = req.body;

    // Find application by logged-in user
    const application = await StudentApplication.findOne({ user: req.user.id });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    // Stop update after authority approval
    if (application.authorityStatus === "Approved") {
      return res.status(403).json({
        success: false,
        message: "You can't update your application because it has already been approved by authority."
      });
    }

    if (!courses) {
      return res.status(400).json({
        success: false,
        message: "Courses are required"
      });
    }

    // Convert courses from JSON string
    let parsedCourses;

    try {
      parsedCourses = JSON.parse(courses);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid courses format"
      });
    }

    // Format course data
    const fixedCourses = parsedCourses.map((course) => ({
      courseTitle: course.courseTitle || "",
      facultyAcr: course.facultyAcr?.trim().toUpperCase() || "",
      courseId: course.courseId?.trim().toUpperCase() || "",
      missedExamDate: course.missedExamDate,
      fine: 2000
    }));

    const fixedFacultyStatuses = buildUpdatedFacultyStatuses(
      fixedCourses,
      application.facultyStatuses || []
    );

    const updateData = {
      courses: fixedCourses,
      facultyStatuses: fixedFacultyStatuses,
      totalFine: Number(totalFine) || fixedCourses.length * 2000,
      reason: reason || application.reason
    };

    // Replace old PDF with new PDF
    if (req.file) {
      if (application.attachment && fs.existsSync(application.attachment)) {
        fs.unlinkSync(application.attachment);
      }

      updateData.attachment = req.file.path;
    }

    const updatedApplication = await StudentApplication.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      application: updatedApplication
    });
  } catch (error) {
    console.error("Update application error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};