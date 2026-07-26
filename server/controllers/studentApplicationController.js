import StudentApplication from "../models/StudentApplication.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// PDF upload
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
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  }
});

const getFacultyAcronym = async (user) => {
  console.log("User inside getFacultyAcronym:", user);

  if (!user || !user.userID) {
    return "";
  }

  return user.userID.toString().trim().toUpperCase();
};

const buildFacultyStatuses = courses => {
  const uniqueFacultyAcronyms = [
    ...new Set(
      courses
        ?.map(course => course.facultyAcr?.trim().toUpperCase())
        .filter(Boolean)
    )
  ];

  return uniqueFacultyAcronyms.map(acr => ({
    facultyAcr: acr,
    status: "Pending"
  }));
};

const ensureFacultyStatuses = async application => {
  if (!application.facultyStatuses || application.facultyStatuses.length === 0) {
    application.facultyStatuses = buildFacultyStatuses(application.courses);
    await application.save();
  }

  return application;
};

// Apply student application
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

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const alreadyApplied = await StudentApplication.findOne({
      user: user._id
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "Application already submitted"
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
      fine: course.fine || 2000
    }));

    const facultyStatuses = buildFacultyStatuses(fixedCourses);

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
      courses: fixedCourses,
      facultyStatuses,
      totalFine: Number(totalFine) || fixedCourses.length * 2000,
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

    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
};

// Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user.id);

    if (!loggedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let query = {};
    let currentFacultyAcr = "";

    if (loggedUser.role?.toLowerCase() === "faculty") {
      currentFacultyAcr = await getFacultyAcronym(loggedUser);

      console.log("currentFacultyAcr =", currentFacultyAcr);

      if (!currentFacultyAcr) {
        return res.status(400).json({
          success: false,
          message: "Faculty acronym not found",
        });
      }

      query = {
        department: loggedUser.department,
        $or: [
          {
            "facultyStatuses.facultyAcr": {
              $regex: `^${currentFacultyAcr}$`,
              $options: "i",
            },
          },
          {
            "courses.facultyAcr": {
              $regex: `^${currentFacultyAcr}$`,
              $options: "i",
            },
          },
        ],
      };
    }

    console.log("==============================");
    console.log("Logged User:", loggedUser);
    console.log("Faculty Acronym:", currentFacultyAcr);
    console.log("Department:", loggedUser.department);
    console.log("Query:", JSON.stringify(query, null, 2));

    const applications = await StudentApplication.find(query)
      .populate("user", "name userID email role department")
      .sort({ createdAt: -1 });

    console.log("Applications Found:", applications.length);

    applications.forEach((app) => {
      console.log("--------------------------------");
      console.log("Student:", app.studentId);
      console.log("Courses:", app.courses);
      console.log("Faculty Statuses:", app.facultyStatuses);
    });

    for (const app of applications) {
      await ensureFacultyStatuses(app);
    }

    res.status(200).json({
      success: true,
      currentFacultyAcr,
      applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single application
export const getApplicationById = async (req, res) => {
  try {
    const loggedUser = await User.findById(req.user.id);

    if (!loggedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    let application = await StudentApplication.findById(req.params.id)
      .populate("user", "name userID email role department");

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found"
      });
    }

    application = await ensureFacultyStatuses(application);

    let currentFacultyAcr = "";

    if (loggedUser.role?.toLowerCase() === "faculty") {
      currentFacultyAcr = await getFacultyAcronym(loggedUser);
    }

    res.status(200).json({
      success: true,
      currentFacultyAcr,
      application
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove single application
export const removeApplication = async (req, res) => {
  try {
    const application = await StudentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    if (application.attachment && fs.existsSync(application.attachment)) {
      fs.unlinkSync(application.attachment);
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      message: "Application removed successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove all applications
export const removeAllApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.find();

    applications.forEach(application => {
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

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get own application
export const getMyApplication = async (req, res) => {
  try {
    let application = await StudentApplication.findOne({
      user: req.user.id
    }).populate("user", "name userID email role department");

    if (!application) {
      return res.status(404).json({
        success: false,
        error: "Application not found"
      });
    }

    application = await ensureFacultyStatuses(application);

    res.status(200).json({
      success: true,
      application
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await StudentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (status === "approved_by_authority") {
      application.authorityStatus = "Approved";
    }

    if (status === "rejected_by_authority") {
      application.authorityStatus = "Rejected";
    }

    if (status === "approved_by_faculty" || status === "rejected_by_faculty") {
      const facultyUser = await User.findById(req.user.id);

      if (!facultyUser) {
        return res.status(404).json({
          success: false,
          message: "Faculty not found"
        });
      }

      const facultyAcr = await getFacultyAcronym(facultyUser);

      if (!facultyAcr) {
        return res.status(400).json({
          success: false,
          message: "Faculty acronym not found"
        });
      }

      if (!application.facultyStatuses || application.facultyStatuses.length === 0) {
        application.facultyStatuses = buildFacultyStatuses(application.courses);
      }

      const facultyStatus = application.facultyStatuses.find(
        item => item.facultyAcr?.trim().toUpperCase() === facultyAcr
      );

    if (!facultyStatus) {
        return res.status(403).json({
          success: false,
          message: `This application is not assigned to this faculty. Your acronym: ${facultyAcr}`
        });
      }

      facultyStatus.status =
        status === "approved_by_faculty" ? "Approved" : "Rejected";
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      application
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Consider amount
export const updateConsiderAmount = async (req, res) => {
  try {
    const { percentage } = req.body;

    const application = await StudentApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

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