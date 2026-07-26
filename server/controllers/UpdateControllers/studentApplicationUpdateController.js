import StudentApplication from "../../models/StudentApplication.js";
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
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  }
});


const buildUpdatedFacultyStatuses = (courses, oldFacultyStatuses = []) => {
  const uniqueFacultyAcronyms = [
    ...new Set(
      courses
        .map(course => course.facultyAcr?.trim().toUpperCase())
        .filter(Boolean)
    )
  ];

  return uniqueFacultyAcronyms.map(acr => {
    const oldStatus = oldFacultyStatuses.find(
      item => item.facultyAcr?.trim().toUpperCase() === acr
    );

    return {
      facultyAcr: acr,
      status: oldStatus?.status || "Pending"
    };
  });
};

export const UpdateStudentApplication = async (req, res) => {
  try {
    const { courses, reason, totalFine } = req.body;

    const application = await StudentApplication.findOne({
      user: req.user.id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

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

    let parsedCourses;

    try {
      parsedCourses = JSON.parse(courses);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid courses format"
      });
    }

    const fixedCourses = parsedCourses.map(course => ({
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

    if (req.file) {
      if (application.attachment && fs.existsSync(application.attachment)) {
        fs.unlinkSync(application.attachment);
      }

      updateData.attachment = req.file.path;
    }

    const updatedApplication = await StudentApplication.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      application: updatedApplication
    });

  } catch (error) {
    console.error("Update application error:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
