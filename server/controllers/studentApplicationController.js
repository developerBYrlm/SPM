import StudentApplication from "../models/StudentApplication.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from "fs";
import PDFDocument from "pdfkit";
import ExamSchedule from "../models/ExamSchedule.js";
import crypto from "crypto";
import { notifyPendingApplicationUsers } from "../services/pendingApplicationMailService.js";
import { notifyStudentApplicationStatusChanged } from "../services/applicationStatusMailService.js";
import { notifyAuthoritySpecialPermission } from "../services/specialPermissionMailService.js";
import {
  syncNewApplicationToSheet,
  syncAuthorityStatusToSheet
} from "../googleSheet/googleSheetService.js";

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

    // const alreadyApplied = await StudentApplication.findOne({
    //   user: user._id
    // });

    // if (alreadyApplied) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Application already submitted"
    //   });
    // }

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
      console.error(error);
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

    // Check student previous special exam participation count
    const studentProfile = await Student.findOne({ user: user._id });
    const specialExamCount = studentProfile ? Number(studentProfile.specialExamCount) || 0 : 0;

    // Students who already attended 5 or more times need Head of Department (Authority) permission for 6th+ attempt
    const requiresSpecialPermission = specialExamCount >= 5;
    const specialPermissionToken = requiresSpecialPermission
      ? crypto.randomBytes(32).toString("hex")
      : null;
    const specialPermissionGranted = !requiresSpecialPermission;

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
      attachment: req.file ? req.file.path : null,
      specialExamCounted: false,
      specialExamCountAtSubmission: specialExamCount,
      requiresSpecialPermission,
      specialPermissionGranted,
      specialPermissionToken
    });

    await application.save();

    // If 6th+ special exam, notify authority with permission authorization email
    if (requiresSpecialPermission) {
      try {
        await notifyAuthoritySpecialPermission({
          application,
          studentUser: user,
          specialExamCount,
          token: specialPermissionToken
        });
      } catch (err) {
        console.error("Special permission authority email error:", err.message);
      }
    }

    // Always notify assigned faculty so faculty can see and approve the application normally
    try {
      await notifyPendingApplicationUsers(application._id);
    } catch (error) {
      console.error("Pending mail notification error:", error.message);
    }

    // Automatically sync new application to Google Sheet backup (default status: "Pending")
    try {
      await syncNewApplicationToSheet(application);
    } catch (error) {
      console.error("Google Sheet initial sync error:", error.message);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
      requiresSpecialPermission,
      specialExamCount,
      warningMessage: requiresSpecialPermission
        ? "You already attend 5 times on special exam and now you meet on Head of department to approve your application with necessary documents IF you have!"
        : null
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Already applied server error"
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
    const application = await StudentApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (
      application.attachment &&
      fs.existsSync(application.attachment)
    ) {
      fs.unlinkSync(application.attachment);
    }

    await application.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Application removed successfully. Special exam count was preserved."
    });
  } catch (error) {
    console.error("Remove application error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Remove all applications
export const removeAllApplications = async (req, res) => {
  try {
    const applications = await StudentApplication.find();

    for (const application of applications) {
      if (
        application.attachment &&
        fs.existsSync(application.attachment)
      ) {
        fs.unlinkSync(application.attachment);
      }
    }

    await StudentApplication.deleteMany({});

    return res.status(200).json({
      success: true,
      message:
        "All applications removed successfully. Student special exam counts were preserved."
    });
  } catch (error) {
    console.error(
      "Remove all applications error:",
      error
    );

    return res.status(500).json({
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

// Update student application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "approved_by_authority",
      "rejected_by_authority",
      "approved_by_faculty",
      "rejected_by_faculty"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status"
      });
    }

    const loggedUser = await User.findById(req.user.id);

    if (!loggedUser) {
      return res.status(404).json({
        success: false,
        message: "Logged user not found"
      });
    }

    let application = await StudentApplication.findById(
      req.params.id
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    let statusChanged = false;
    let changedRole = "";
    let changedStatus = "";

    // ==========================================
    // AUTHORITY APPROVAL
    // ==========================================

    if (status === "approved_by_authority") {
      if (loggedUser.role?.toLowerCase() !== "authority") {
        return res.status(403).json({
          success: false,
          message:
            "Only an authority user can approve this application"
        });
      }

      const studentProfile = await Student.findOne({
        user: application.user
      }).populate({
        path: "user",
        select: "role"
      });

      if (
        !studentProfile ||
        !studentProfile.user ||
        studentProfile.user.role?.toLowerCase() !== "student"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Valid student profile not found for this application"
        });
      }

      const wasAlreadyApproved =
        application.authorityStatus === "Approved";

      application.authorityStatus = "Approved";


      application.approvedByAuthority =
        loggedUser._id;


      if (application.specialExamCounted !== true) {
        const updatedStudent =
          await Student.findOneAndUpdate(
            {
              _id: studentProfile._id,
              user: application.user
            },
            {
              $inc: {
                specialExamCount: 1
              }
            },
            {
              new: true,
              runValidators: true
            }
          );

        if (!updatedStudent) {
          return res.status(500).json({
            success: false,
            message:
              "Application approval failed because student special exam count could not be updated"
          });
        }

        application.specialExamCounted = true;

        console.log("Special exam count increased:", {
          studentId: updatedStudent.studentId,
          specialExamCount:
            updatedStudent.specialExamCount,
          applicationId:
            application._id.toString()
        });
      } else {
        console.log(
          "Special exam count already recorded for application:",
          application._id.toString()
        );
      }

      statusChanged =
        !wasAlreadyApproved ||
        application.approvedByAuthority?.toString() !==
          loggedUser._id.toString();

      changedRole = `Authority (${loggedUser.name})`;
      changedStatus = "Approved";
    }

    // ==========================================
    // AUTHORITY REJECTION
    // ==========================================

    if (status === "rejected_by_authority") {
      if (loggedUser.role?.toLowerCase() !== "authority") {
        return res.status(403).json({
          success: false,
          message:
            "Only an authority user can reject this application"
        });
      }

      statusChanged =
        application.authorityStatus !== "Rejected";

      application.authorityStatus = "Rejected";
      application.approvedByAuthority = null;

      changedRole = `Authority (${loggedUser.name})`;
      changedStatus = "Rejected";
    }

    // ==========================================
    // FACULTY APPROVAL OR REJECTION
    // ==========================================

    if (
      status === "approved_by_faculty" ||
      status === "rejected_by_faculty"
    ) {
      if (loggedUser.role?.toLowerCase() !== "faculty") {
        return res.status(403).json({
          success: false,
          message:
            "Only faculty can update faculty status"
        });
      }

      const facultyAcr =
        await getFacultyAcronym(loggedUser);

      if (!facultyAcr) {
        return res.status(400).json({
          success: false,
          message: "Faculty acronym not found"
        });
      }

      if (
        !application.facultyStatuses ||
        application.facultyStatuses.length === 0
      ) {
        application.facultyStatuses =
          buildFacultyStatuses(application.courses);
      }

      const facultyStatus =
        application.facultyStatuses.find(
          item =>
            item.facultyAcr
              ?.trim()
              .toUpperCase() === facultyAcr
        );

      if (!facultyStatus) {
        return res.status(403).json({
          success: false,
          message:
            `This application is not assigned to faculty ${facultyAcr}`
        });
      }

      const newFacultyStatus =
        status === "approved_by_faculty"
          ? "Approved"
          : "Rejected";

      statusChanged =
        facultyStatus.status !== newFacultyStatus;

      facultyStatus.status = newFacultyStatus;

      application.markModified("facultyStatuses");

      changedRole = `Faculty (${facultyAcr})`;
      changedStatus = newFacultyStatus;
    }

    application.markModified(
      "approvedByAuthority"
    );

    await application.save();

    application =
      await StudentApplication.findById(
        application._id
      )
        .populate(
          "approvedByAuthority",
          "name email userID role department"
        )
        .populate(
          "user",
          "name email userID role department"
        );

    console.log("Updated application status:", {
      applicationId: application._id,
      authorityStatus:
        application.authorityStatus,
      specialExamCounted:
        application.specialExamCounted,
      approvedByAuthority:
        application.approvedByAuthority
    });

    if (statusChanged) {
      try {
        await notifyStudentApplicationStatusChanged({
          applicationId: application._id,
          changedByUserId: req.user.id,
          changedRole,
          changedStatus
        });
      } catch (error) {
        console.error(
          "Student status mail error:",
          error.message
        );
      }
    }

    // Sync updated authority status to Google Sheet
    if (status === "approved_by_authority" || status === "rejected_by_authority") {
      try {
        await syncAuthorityStatusToSheet(application.studentId, application.authorityStatus);
      } catch (error) {
        console.error("Google Sheet authority status sync error:", error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: statusChanged
        ? "Status updated successfully"
        : "Status was already updated",
      application
    });
  } catch (error) {
    console.error(
      "Update application status error:",
      error
    );

    return res.status(500).json({
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

// Download professional A4 admit card PDF
export const downloadAdmitCard = async (req, res) => {
  try {
    // ==========================================
    // APPLICATION INFORMATION
    // ==========================================

    const application = await StudentApplication.findOne({
      user: req.user.id
    })
      .populate(
        "user",
        "name userID email department profileImage"
      )
      .populate(
        "approvedByAuthority",
        "name email userID role department"
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    if (application.authorityStatus !== "Approved") {
      return res.status(403).json({
        success: false,
        message:
          "Admit card is available only after authority approval"
      });
    }

    if (!application.approvedByAuthority?.name) {
      return res.status(409).json({
        success: false,
        message:
          "Approving authority information is missing. Please ask the authority to approve the application again."
      });
    }

    const approvingAuthorityName =
      application.approvedByAuthority.name;

    // ==========================================
    // FACULTY NAME MAP
    // ==========================================

    const facultyUsers = await User.find({
      role: {
        $regex: /^faculty$/i
      }
    }).select("name userID");

    const facultyMap = {};

    facultyUsers.forEach((faculty) => {
      const facultyAcronym = faculty.userID
        ?.toString()
        .trim()
        .toUpperCase();

      if (facultyAcronym) {
        facultyMap[facultyAcronym] = faculty.name;
      }
    });

    // ==========================================
    // SPECIAL EXAM SCHEDULE
    // ==========================================

    const examSchedule = await ExamSchedule.findOne({
      department: application.department
    });

    // ==========================================
    // FONT AND IMAGE PATHS
    // ==========================================

    const signatureFontPath = path.resolve(
      __dirname,
      "../assets/fonts/GreatVibes-Regular.ttf"
    );

    const stampPath = path.resolve(
      __dirname,
      "../assets/approved-stamp.png"
    );

    console.log("Signature font path:", signatureFontPath);
    console.log(
      "Signature font exists:",
      fs.existsSync(signatureFontPath)
    );

    console.log("Stamp path:", stampPath);
    console.log(
      "Stamp exists:",
      fs.existsSync(stampPath)
    );

    if (!fs.existsSync(signatureFontPath)) {
      return res.status(500).json({
        success: false,
        message:
          "Signature font file not found inside server/assets/fonts"
      });
    }

    // ==========================================
    // RESPONSE HEADERS
    // ==========================================

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="special-exam-admit-card-${application.studentId}.pdf"`
    );

    // ==========================================
    // PDF INITIALIZATION
    // ==========================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: "Special Exam Admit Card",
        Author: "Northern University Bangladesh",
        Subject:
          `Special Exam Admit Card for ${application.studentId}`
      }
    });

    // Register signature font
    doc.registerFont(
      "SignatureFont",
      signatureFontPath
    );

    doc.pipe(res);

    // ==========================================
    // PAGE SETTINGS
    // ==========================================

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    const leftMargin = 30;
    const rightMargin = 30;

    const contentWidth =
      pageWidth - leftMargin - rightMargin;

    const primaryColor = "#111111";
    const borderColor = "#555555";
    const lightBackground = "#F0F2F5";
    const greenColor = "#008C2E";

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    const safeText = (value) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return "N/A";
      }

      return String(value);
    };

    const formatPdfDate = (date) => {
      if (!date) {
        return "N/A";
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
      }

      return parsedDate.toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      );
    };

    const fitText = (
      text,
      x,
      y,
      width,
      options = {}
    ) => {
      const value = safeText(text);

      let fontSize =
        options.fontSize || 10;

      const minimumFontSize =
        options.minimumFontSize || 7;

      const selectedFont =
        options.font || "Helvetica";

      doc
        .font(selectedFont)
        .fontSize(fontSize);

      while (
        doc.widthOfString(value) > width &&
        fontSize > minimumFontSize
      ) {
        fontSize -= 0.5;

        doc
          .font(selectedFont)
          .fontSize(fontSize);
      }

      doc
        .fillColor(
          options.color || primaryColor
        )
        .text(
          value,
          x,
          y,
          {
            width,
            align:
              options.align || "left",
            lineBreak: false,
            ellipsis: true
          }
        );
    };

    const drawSectionTitle = (
      number,
      title,
      y
    ) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(primaryColor)
        .text(
          `${number}. ${title.toUpperCase()}`,
          leftMargin,
          y,
          {
            width: contentWidth,
            lineBreak: false
          }
        );

      return y + 16;
    };

    const drawInfoLine = (
      label,
      value,
      x,
      y,
      labelWidth = 78,
      totalWidth = 250
    ) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(
          `${label}:`,
          x,
          y,
          {
            width: labelWidth,
            lineBreak: false
          }
        );

      fitText(
        value,
        x + labelWidth,
        y,
        totalWidth - labelWidth,
        {
          font: "Helvetica",
          fontSize: 8.5,
          minimumFontSize: 7
        }
      );
    };

    // ==========================================
    // UNIVERSITY HEADER
    // ==========================================

    let currentY = 27;

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(primaryColor)
      .text(
        "NORTHERN UNIVERSITY BANGLADESH",
        leftMargin,
        currentY,
        {
          width: contentWidth,
          align: "center",
          lineBreak: false
        }
      );

    currentY += 22;

    doc
      .font("Helvetica-Bold")
      .fontSize(10.8)
      .fillColor(primaryColor)
      .text(
        "SPECIAL EXAM ADMIT CARD",
        leftMargin,
        currentY,
        {
          width: contentWidth,
          align: "center",
          lineBreak: false
        }
      );

    currentY += 20;

    doc
      .moveTo(leftMargin, currentY)
      .lineTo(
        pageWidth - rightMargin,
        currentY
      )
      .lineWidth(0.8)
      .strokeColor(borderColor)
      .stroke();

    currentY += 14;

    // ==========================================
    // 1. STUDENT INFORMATION
    // ==========================================

    currentY = drawSectionTitle(
      1,
      "Student Information",
      currentY
    );

    const firstColumnX = leftMargin;
    const secondColumnX =
      leftMargin + 270;

    drawInfoLine(
      "Name",
      application.name ||
        application.user?.name,
      firstColumnX,
      currentY,
      78,
      250
    );

    drawInfoLine(
      "Student ID",
      application.studentId ||
        application.user?.userID,
      secondColumnX,
      currentY,
      82,
      235
    );

    currentY += 15;

    drawInfoLine(
      "Department",
      application.department,
      firstColumnX,
      currentY,
      78,
      250
    );

    drawInfoLine(
      "Semester",
      application.semester,
      secondColumnX,
      currentY,
      82,
      235
    );

    currentY += 15;

    drawInfoLine(
      "Section",
      application.section,
      firstColumnX,
      currentY,
      78,
      250
    );

    drawInfoLine(
      "Exam Type",
      application.missedExamType,
      secondColumnX,
      currentY,
      82,
      235
    );

    currentY += 23;

    // ==========================================
    // 2. MISSED EXAM TABLE
    // ==========================================

    currentY = drawSectionTitle(
      2,
      "Missed Exam(s)",
      currentY
    );

    const tableX = leftMargin;
    const tableWidth = contentWidth;

    const courseColumnWidth =
      tableWidth * 0.46;

    const dateColumnWidth =
      tableWidth * 0.22;

    const facultyColumnWidth =
      tableWidth * 0.32;

    const courseColumnX = tableX;

    const dateColumnX =
      courseColumnX + courseColumnWidth;

    const facultyColumnX =
      dateColumnX + dateColumnWidth;

    const headerHeight = 27;
    const rowHeight = 27;

    // Table header background
    doc
      .rect(
        tableX,
        currentY,
        tableWidth,
        headerHeight
      )
      .fillColor(lightBackground)
      .fill();

    // Table header border
    doc
      .rect(
        tableX,
        currentY,
        tableWidth,
        headerHeight
      )
      .lineWidth(0.7)
      .strokeColor(borderColor)
      .stroke();

    // Header column lines
    doc
      .moveTo(dateColumnX, currentY)
      .lineTo(
        dateColumnX,
        currentY + headerHeight
      )
      .stroke();

    doc
      .moveTo(facultyColumnX, currentY)
      .lineTo(
        facultyColumnX,
        currentY + headerHeight
      )
      .stroke();

    fitText(
      "Course ID & Name",
      courseColumnX + 5,
      currentY + 8,
      courseColumnWidth - 10,
      {
        font: "Helvetica-Bold",
        fontSize: 9,
        minimumFontSize: 7,
        align: "center"
      }
    );

    fitText(
      "Missed Date",
      dateColumnX + 5,
      currentY + 8,
      dateColumnWidth - 10,
      {
        font: "Helvetica-Bold",
        fontSize: 9,
        minimumFontSize: 7,
        align: "center"
      }
    );

    fitText(
      "Faculty Name (Acronym)",
      facultyColumnX + 5,
      currentY + 8,
      facultyColumnWidth - 10,
      {
        font: "Helvetica-Bold",
        fontSize: 9,
        minimumFontSize: 7,
        align: "center"
      }
    );

    currentY += headerHeight;

    // ==========================================
    // COURSE ROWS
    // ==========================================

    const courses = Array.isArray(
      application.courses
    )
      ? application.courses
      : [];

    courses.forEach((course) => {
      const facultyAcronym =
        course.facultyAcr
          ?.toString()
          .trim()
          .toUpperCase() || "N/A";

      const facultyName =
        facultyMap[facultyAcronym] ||
        "N/A";

      const courseId =
        safeText(course.courseId);

      const courseTitle =
        safeText(course.courseTitle);

      const courseText =
        `${courseTitle} (${courseId})`;

      const missedDate = formatPdfDate(
        course.missedExamDate ||
          application.missedExamDate
      );

      const facultyText =
        facultyName === "N/A"
          ? facultyAcronym
          : `${facultyName} (${facultyAcronym})`;

      // Row background
      doc
        .rect(
          tableX,
          currentY,
          tableWidth,
          rowHeight
        )
        .fillColor("#FFFFFF")
        .fill();

      // Row outer border
      doc
        .rect(
          tableX,
          currentY,
          tableWidth,
          rowHeight
        )
        .lineWidth(0.7)
        .strokeColor(borderColor)
        .stroke();

      // Column lines
      doc
        .moveTo(dateColumnX, currentY)
        .lineTo(
          dateColumnX,
          currentY + rowHeight
        )
        .stroke();

      doc
        .moveTo(
          facultyColumnX,
          currentY
        )
        .lineTo(
          facultyColumnX,
          currentY + rowHeight
        )
        .stroke();

      fitText(
        courseText,
        courseColumnX + 6,
        currentY + 8,
        courseColumnWidth - 12,
        {
          font: "Helvetica",
          fontSize: 8.5,
          minimumFontSize: 6.5,
          align: "center"
        }
      );

      fitText(
        missedDate,
        dateColumnX + 5,
        currentY + 8,
        dateColumnWidth - 10,
        {
          font: "Helvetica",
          fontSize: 8.5,
          minimumFontSize: 7,
          align: "center"
        }
      );

      fitText(
        facultyText,
        facultyColumnX + 6,
        currentY + 8,
        facultyColumnWidth - 12,
        {
          font: "Helvetica",
          fontSize: 8.5,
          minimumFontSize: 6.5,
          align: "center"
        }
      );

      currentY += rowHeight;
    });

    if (courses.length === 0) {
      doc
        .rect(
          tableX,
          currentY,
          tableWidth,
          rowHeight
        )
        .lineWidth(0.7)
        .strokeColor(borderColor)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(primaryColor)
        .text(
          "No missed course information found",
          tableX,
          currentY + 8,
          {
            width: tableWidth,
            align: "center",
            lineBreak: false
          }
        );

      currentY += rowHeight;
    }

    currentY += 16;

    // ==========================================
    // 3. SPECIAL EXAM DETAILS
    // ==========================================

    currentY = drawSectionTitle(
      3,
      "Special Exam Details",
      currentY
    );

    drawInfoLine(
      "Special Exam Date",
      examSchedule?.specialExamStartDate
        ? formatPdfDate(
            examSchedule.specialExamStartDate
          )
        : "To be announced",
      leftMargin,
      currentY,
      116,
      contentWidth
    );

    currentY += 14;

    drawInfoLine(
      "Application Deadline",
      examSchedule?.applicationDeadlineDate
        ? formatPdfDate(
            examSchedule.applicationDeadlineDate
          )
        : "N/A",
      leftMargin,
      currentY,
      116,
      contentWidth
    );

    currentY += 20;

// ==========================================
// APPROVAL AND SIGNATURE AREA
// ==========================================

const approvalBlockWidth = 230;

const approvalBlockX =
  pageWidth -
  rightMargin -
  approvalBlockWidth -
  5;

// Approved by label
doc
  .font("Helvetica")
  .fontSize(8.5)
  .fillColor(primaryColor)
  .text(
    "Approved by:",
    approvalBlockX,
    currentY,
    {
      width: approvalBlockWidth,
      align: "center",
      lineBreak: false
    }
  );

currentY += 10;

// Signature-style authority name
doc
  .font(signatureFontPath)
  .fontSize(30)
  .fillColor("#008C2E")
  .text(
    approvingAuthorityName,
    approvalBlockX,
    currentY,
    {
      width: approvalBlockWidth,
      height: 50,
      align: "center",
      lineBreak: false
    }
  );

// Signature name এবং line-এর gap
currentY += 37;

// Signature line
doc
  .moveTo(
    approvalBlockX + 25,
    currentY
  )
  .lineTo(
    approvalBlockX +
      approvalBlockWidth -
      25,
    currentY
  )
  .lineWidth(0.6)
  .strokeColor("#555555")
  .stroke();

currentY += 5;

// Signature label
doc
  .font("Helvetica")
  .fontSize(7)
  .fillColor(primaryColor)
  .text(
    "Authorized Signature",
    approvalBlockX,
    currentY,
    {
      width: approvalBlockWidth,
      align: "center",
      lineBreak: false
    }
  );
    // ==========================================
    // SIGNATURE-STYLE AUTHORITY NAME
    // ==========================================

    doc
      .font("SignatureFont")
      .fontSize(27)
      .fillColor(greenColor)
      .text(
        approvingAuthorityName,
        approvalBlockX,
        currentY,
        {
          width: approvalBlockWidth,
          height: 45,
          align: "center",
          lineBreak: false
        }
      );

    // Signature থেকে line-এর distance
    currentY += 33;

    // Signature line
    doc
      .moveTo(
        approvalBlockX + 30,
        currentY
      )
      .lineTo(
        approvalBlockX +
          approvalBlockWidth -
          30,
        currentY
      )
      .lineWidth(0.6)
      .strokeColor(borderColor)
      .stroke();

    currentY += 5;

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(primaryColor)
      .text(
        "Authorized Signature",
        approvalBlockX,
        currentY,
        {
          width: approvalBlockWidth,
          align: "center",
          lineBreak: false
        }
      );

    // ==========================================
    // OPTIONAL APPROVED STAMP
    // ==========================================

    /*
      approved-stamp.png valid হলে stamp দেখাবে।
      Image invalid হলে PDF generation যেন বন্ধ না হয়,
      তাই try/catch ব্যবহার করা হয়েছে।
    */

    if (fs.existsSync(stampPath)) {
      try {
        doc
          .save()
          .opacity(0.85)
          .image(
            stampPath,
            leftMargin + 45,
            currentY - 52,
            {
              width: 80
            }
          )
          .restore();
      } catch (stampError) {
        console.error(
          "Approved stamp could not be loaded:",
          stampError.message
        );
      }
    }

    // ==========================================
    // FOOTER
    // ==========================================

    const footerY =
      pageHeight - 38;

    doc
      .moveTo(
        leftMargin,
        footerY - 7
      )
      .lineTo(
        pageWidth - rightMargin,
        footerY - 7
      )
      .lineWidth(0.4)
      .strokeColor("#AAAAAA")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(6.8)
      .fillColor("#555555")
      .text(
        "This is a system-generated special examination admit card. Print this document on A4 paper.",
        leftMargin,
        footerY,
        {
          width: contentWidth,
          align: "center",
          lineBreak: false
        }
      );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error(
      "Download admit card error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    try {
      res.end();
    } catch (streamError) {
      console.error(
        "PDF response close error:",
        streamError.message
      );
    }
  }
};

// Grant special permission when authority clicks the button in the permission request email
export const grantSpecialPermissionFromEmail = async (req, res) => {
  try {
    const { token, appId } = req.query;

    if (!token || !appId) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Special Exam Permission - Invalid Request</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #ffffff; max-width: 520px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 36px 30px; text-align: center; border-top: 5px solid #dc2626; }
            h2 { color: #dc2626; margin: 0 0 12px; font-size: 22px; }
            p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Invalid Permission Link</h2>
            <p>The permission link is missing required authorization parameters or has expired.</p>
          </div>
        </body>
        </html>
      `);
    }

    const application = await StudentApplication.findById(appId);

    if (!application) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Special Exam Permission - Not Found</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #ffffff; max-width: 520px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 36px 30px; text-align: center; border-top: 5px solid #dc2626; }
            h2 { color: #dc2626; margin: 0 0 12px; font-size: 22px; }
            p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Application Not Found</h2>
            <p>The requested student application could not be found in the database.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (application.specialPermissionToken !== token) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Special Exam Permission - Unauthorized</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #ffffff; max-width: 520px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 36px 30px; text-align: center; border-top: 5px solid #dc2626; }
            h2 { color: #dc2626; margin: 0 0 12px; font-size: 22px; }
            p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Invalid Token</h2>
            <p>This authorization token does not match the application record or has been superseded.</p>
          </div>
        </body>
        </html>
      `);
    }

    const frontendBaseUrl =
      process.env.FRONTEND_URL || "https://spm-2-j7gf.onrender.com";
    const pendingDashboardUrl = `${frontendBaseUrl}/authority-dashboard/students-applications-pending`;

    if (application.specialPermissionGranted === true) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Special Exam Permission - Already Granted</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #ffffff; max-width: 540px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 36px 30px; text-align: center; border-top: 5px solid #16a34a; }
            .icon { font-size: 48px; color: #16a34a; margin-bottom: 14px; }
            h2 { color: #0f172a; margin: 0 0 12px; font-size: 22px; font-weight: 700; }
            p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px; }
            .info-box { background: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin: 18px 0; text-align: left; font-size: 14px; }
            .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 26px; font-size: 15px; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h2>Permission Already Granted</h2>
            <p>You have already granted special examination permission for this student. The application is currently sorted in your Authority Pending List.</p>
            <div class="info-box">
              <div class="info-row"><strong>Student Name:</strong> <span>${application.name}</span></div>
              <div class="info-row"><strong>Student ID:</strong> <span>${application.studentId}</span></div>
              <div class="info-row"><strong>Department:</strong> <span>${application.department}</span></div>
              <div class="info-row"><strong>Status:</strong> <span>${application.authorityStatus}</span></div>
            </div>
            <a href="${pendingDashboardUrl}" class="btn">Open Pending Applications</a>
          </div>
        </body>
        </html>
      `);
    }

    // Grant permission
    application.specialPermissionGranted = true;
    application.specialPermissionGrantedAt = new Date();
    await application.save();

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Special Exam Permission - Granted</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: #ffffff; max-width: 540px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); padding: 36px 30px; text-align: center; border-top: 5px solid #16a34a; }
          .icon { font-size: 52px; color: #16a34a; margin-bottom: 14px; }
          h2 { color: #0f172a; margin: 0 0 10px; font-size: 22px; font-weight: 700; }
          .sub { color: #16a34a; font-weight: 600; font-size: 15px; margin: 0 0 16px; }
          p { color: #475569; font-size: 14.5px; line-height: 1.6; margin: 0 0 20px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin: 18px 0; text-align: left; font-size: 14px; }
          .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 15px; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">🎉</div>
          <h2>Special Permission Granted!</h2>
          <div class="sub">Authority Authorization Successful</div>
          <p>
            You have granted permission for <strong>${application.name}</strong> (${application.studentId}) to participate in their special examination (5+ times exception).
          </p>
          <div class="info-box">
            <div class="info-row"><strong>Student ID:</strong> <span>${application.studentId}</span></div>
            <div class="info-row"><strong>Student Name:</strong> <span>${application.name}</span></div>
            <div class="info-row"><strong>Department:</strong> <span>${application.department}</span></div>
            <div class="info-row"><strong>Sorting:</strong> <span style="color:#16a34a;font-weight:600;">Added to Authority Pending List</span></div>
          </div>
          <p style="font-size: 13.5px; color: #64748b;">
            This application is now sorted in your Authority Pending List. You can now open your dashboard to give final approval or review the application.
          </p>
          <a href="${pendingDashboardUrl}" class="btn">View in Authority Pending List</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("grantSpecialPermissionFromEmail error:", error);
    return res.status(500).send("Server error processing special permission");
  }
};

// Grant special permission directly by authenticated authority inside dashboard
export const grantSpecialPermissionAuth = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role?.toLowerCase() !== "authority") {
      return res.status(403).json({
        success: false,
        message: "Only authority can grant special permission"
      });
    }

    const application = await StudentApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    application.specialPermissionGranted = true;
    application.specialPermissionGrantedAt = new Date();
    application.specialPermissionGrantedBy = req.user.id;
    await application.save();

    return res.status(200).json({
      success: true,
      message: "Special exam permission granted successfully. Application is now visible in Pending list.",
      application
    });
  } catch (error) {
    console.error("grantSpecialPermissionAuth error:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


