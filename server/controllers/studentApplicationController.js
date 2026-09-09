import StudentApplication from "../models/studentApplication.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import ExamSchedule from "../models/ExamSchedule.js";
import { notifyPendingApplicationUsers } from "../services/pendingApplicationMailService.js";
import { notifyStudentApplicationStatusChanged } from "../services/applicationStatusMailService.js";

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

// তারিখ সুন্দর ফরম্যাটে দেখানোর জন্য (admit card PDF এ ব্যবহার হবে)
const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
      attachment: req.file ? req.file.path : null,
      specialExamCounted: false
    });

    await application.save();

    notifyPendingApplicationUsers(application._id).catch((error) => {

      console.error("Pending mail notification error:", error.message);
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
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

    /*
      শুধু application delete হবে।
      Student profile-এর specialExamCount কমবে না।
    */
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

      /*
        Student profile অবশ্যই Student collection-এ থাকতে হবে।
        Faculty, ACAD, Authority বা IT-এর কোনো profile count হবে না।
      */
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

      /*
        যে authority approve করছে তার User ObjectId save হবে।
        Admit card-এ এই reference populate করে authority name দেখাবে।
      */
      application.approvedByAuthority =
        loggedUser._id;

      /*
        এই application আগে count না হলে শুধু একবার count বাড়বে।
      */
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

        /*
          Count বাড়ানোর পরে application-এ record রাখা হচ্ছে।
          এটি পরবর্তী approval-এ duplicate count আটকাবে।
        */
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

      /*
        specialExamCounted false করা হবে না।

        কারণ application একবার approved হওয়ার পরে count
        permanent history হিসেবে Student profile-এ থাকবে।

        Reject করে আবার Approve করলেও count দ্বিতীয়বার বাড়বে না।
      */

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
      notifyStudentApplicationStatusChanged({
        applicationId: application._id,
        changedByUserId: req.user.id,
        changedRole,
        changedStatus
      }).catch(error => {
        console.error(
          "Student status mail error:",
          error.message
        );
      });
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

    /*
      Authority name ছাড়া admit card generate হবে না।
      পুরোনো application হলে authority দিয়ে আবার approve করতে হবে।
    */
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

    facultyUsers.forEach(faculty => {
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

    console.log("Admit card authority:", {
      authorityId:
        application.approvedByAuthority._id.toString(),
      authorityName: approvingAuthorityName
    });

    // ==========================================
    // RESPONSE HEADERS
    // ==========================================

    res.setHeader("Content-Type", "application/pdf");

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
        Subject: `Special Exam Admit Card for ${application.studentId}`
      }
    });

    doc.pipe(res);

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

    // University title font size
    const universityTitleFontSize = 18;

    // University title-এর চেয়ে 40% ছোট
    const admitTitleFontSize =
      universityTitleFontSize * 0.6;

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    const safeText = value => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return "N/A";
      }

      return String(value);
    };

    /*
      Available width অনুযায়ী text ছোট করবে।
      Text কোনো column-এর বাইরে যাবে না।
    */
    const fitText = (
      text,
      x,
      y,
      width,
      options = {}
    ) => {
      const value = safeText(text);

      let fontSize = options.fontSize || 10;

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
        .fillColor(options.color || primaryColor)
        .text(value, x, y, {
          width,
          align: options.align || "left",
          lineBreak: false,
          ellipsis: true
        });
    };

    /*
      Section heading:
      1. STUDENT INFORMATION
      2. MISSED EXAM(S)
      3. SPECIAL EXAM DETAILS
    */
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

    /*
      Student এবং exam information line।
    */
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
        .text(`${label}:`, x, y, {
          width: labelWidth,
          lineBreak: false
        });

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

    /*
      RED MARKED AREA:
      University name এখন bold।
    */
    doc
      .font("Helvetica-Bold")
      .fontSize(universityTitleFontSize)
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

    /*
      RED এবং BLUE heading-এর মাঝখানের gap কমানো হয়েছে।
    */
    currentY += 22;

    /*
      BLUE MARKED AREA:
      University title-এর চেয়ে 40% ছোট।
      18 × 0.6 = 10.8 approximately 11pt
    */
    doc
      .font("Helvetica-Bold")
      .fontSize(admitTitleFontSize)
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

    /*
      Admit title এবং horizontal line-এর gap-ও compact।
    */
    currentY += 20;

    doc
      .moveTo(leftMargin, currentY)
      .lineTo(pageWidth - rightMargin, currentY)
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
    const secondColumnX = leftMargin + 270;

    drawInfoLine(
      "Name",
      application.name || application.user?.name,
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

    // ==========================================
    // TABLE HEADER BACKGROUND
    // ==========================================

    doc
      .rect(
        tableX,
        currentY,
        tableWidth,
        headerHeight
      )
      .fillColor(lightBackground)
      .fill();

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
    // MISSED COURSE ROWS
    // ==========================================

    const courses =
      Array.isArray(application.courses)
        ? application.courses
        : [];

    /*
      একাধিক course থাকলে প্রত্যেকটি আলাদা row হবে।
      একই faculty-এর একাধিক course-ও আলাদা row হবে।
    */
    courses.forEach(course => {
      const facultyAcronym =
        course.facultyAcr
          ?.toString()
          .trim()
          .toUpperCase() || "N/A";

      const facultyName =
        facultyMap[facultyAcronym] || "N/A";

      const courseId = safeText(course.courseId);
      const courseTitle = safeText(course.courseTitle)
      
      const courseText = `${courseTitle} (${courseId})`;

      const missedDate = formatDate(
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

      // Column border
      doc
        .moveTo(dateColumnX, currentY)
        .lineTo(
          dateColumnX,
          currentY + rowHeight
        )
        .stroke();

      doc
        .moveTo(facultyColumnX, currentY)
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
            align: "center"
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

    /*
      PINK marked section-এর মতো line gap compact করা হয়েছে।
    */
    drawInfoLine(
      "Special Exam Date",
      examSchedule?.specialExamStartDate
        ? formatDate(
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
        ? formatDate(
            examSchedule.applicationDeadlineDate
          )
        : "N/A",
      leftMargin,
      currentY,
      116,
      contentWidth
    );

    currentY += 21;

    // ==========================================
    // APPROVAL AREA
    // ==========================================

    const approvalBlockWidth = 200;

    const approvalBlockX =
      pageWidth -
      rightMargin -
      approvalBlockWidth;

    /*
      Pink area-এর line gap কমানো হয়েছে।
    */
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

    currentY += 12;

    /*
      Authority name bold থাকবে।
    */
    fitText(
      approvingAuthorityName,
      approvalBlockX,
      currentY,
      approvalBlockWidth,
      {
        font: "Helvetica-Bold",
        fontSize: 10,
        minimumFontSize: 7.5,
        color: greenColor,
        align: "center"
      }
    );

    /*
      GREEN MARKED AREA:
      Authority ID সম্পূর্ণ remove করা হয়েছে।
      এখানে আর userID বা ID: CSE দেখানো হবে না।
    */

    currentY += 15;

    /*
      Signature line authority name-এর কাছাকাছি আনা হয়েছে।
    */
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
      .strokeColor(borderColor)
      .stroke();

    currentY += 4;

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
    // APPROVED STAMP
    // ==========================================

    const stampPath = path.join(
      process.cwd(),
      "assets",
      "approved-stamp.png"
    );

    if (fs.existsSync(stampPath)) {
      doc
        .opacity(0.85)
        .image(
          stampPath,
          leftMargin + 45,
          currentY - 52,
          {
            width: 80
          }
        );

      doc.opacity(1);
    }

    // ==========================================
    // FOOTER
    // ==========================================

    const footerY = pageHeight - 38;

    doc
      .moveTo(leftMargin, footerY - 7)
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


