import StudentApplication from "../models/StudentApplication.js";
import User from "../models/User.js";
import PendingMailLog from "../models/PendingMailLog.js";
import { sendEmail } from "./emailService.js";

// Change value to uppercase format
const normalize = (value) => value?.toString().trim().toUpperCase() || "";

// Get user role in lowercase
const getUserRole = (user) => user.role?.toString().trim().toLowerCase() || "";

// Build application view link
const buildApplicationViewLink = (applicationId, targetType) => {
  const baseUrl = process.env.FRONTEND_URL || "https://spm-1-u37a.onrender.com";

  if (targetType === "faculty") {
    return `${baseUrl}/faculty-dashboard/application/application-view/${applicationId}`;
  }

  if (targetType === "authority") {
    return `${baseUrl}/authority-dashboard/application/application-view/${applicationId}`;
  }

  return `${baseUrl}/login`;
};

// Get courses for the receiver
const getCoursesForRecipient = ({ application, targetType, facultyAcr }) => {
  const courses = application.courses || [];

  if (targetType === "faculty") {
    return courses.filter(
      (course) => normalize(course.facultyAcr) === normalize(facultyAcr)
    );
  }

  return courses;
};

// Build course table rows
const buildCourseRows = ({ application, targetType, facultyAcr }) => {
  const courses = getCoursesForRecipient({
    application,
    targetType,
    facultyAcr,
  });

  if (!courses.length) {
    return `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
      </tr>
    `;
  }

  return courses.map((course) => `
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${course.courseId || "N/A"}</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${course.courseTitle || "N/A"}</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${course.facultyAcr || "N/A"}</td>
    </tr>
  `).join("");
};

// Build pending application email
const buildPendingMailHtml = ({
  application,
  recipient,
  targetType,
  facultyAcr,
}) => {
  const viewLink = buildApplicationViewLink(application._id, targetType);
  const targetText =
    targetType === "authority"
      ? "Authority Approval"
      : `Faculty Approval${facultyAcr ? ` (${facultyAcr})` : ""}`;

  const courseSectionTitle =
    targetType === "faculty"
      ? "Your Assigned Pending Courses"
      : "Application Courses";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>New Pending Special Exam Application</h2>
      <p>Respected ${recipient.name || "User"},</p>
      <p>A new special exam application is pending for your approval.</p>

      <table style="border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="padding: 6px 12px;"><strong>Student ID:</strong></td>
          <td style="padding: 6px 12px;">${application.studentId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Student Name:</strong></td>
          <td style="padding: 6px 12px;">${application.name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Department:</strong></td>
          <td style="padding: 6px 12px;">${application.department}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Exam Type:</strong></td>
          <td style="padding: 6px 12px;">${application.missedExamType}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Pending For:</strong></td>
          <td style="padding: 6px 12px;">${targetText}</td>
        </tr>
      </table>

      <h3>${courseSectionTitle}</h3>
      <table style="border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Course Code</th>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Course Title</th>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Faculty Acronym</th>
        </tr>
        ${buildCourseRows({ application, targetType, facultyAcr })}
      </table>

      <p>
        ${viewLink}
          Click here to View Application
        </a>
      </p>

      <br />
      <p>Special Exam Application System</p>
    </div>
  `;
};

// Get authority users from application department
const getAuthorityRecipients = async (application) => {
  const users = await User.find({
    department: application.department,
    email: { $exists: true, $ne: "" },
  });

  return users.filter((user) => getUserRole(user) === "authority");
};

// Get pending faculty users
const getFacultyRecipients = async (application) => {
  const pendingFacultyAcronyms = [
    ...new Set(
      application.facultyStatuses
        ?.filter((item) => item.status === "Pending")
        .map((item) => normalize(item.facultyAcr))
        .filter(Boolean)
    ),
  ];

  if (!pendingFacultyAcronyms.length) return [];

  const users = await User.find({
    department: application.department,
    email: { $exists: true, $ne: "" },
  });

  return users
    .filter((user) => getUserRole(user) === "faculty")
    .filter((user) => pendingFacultyAcronyms.includes(normalize(user.userID)))
    .map((user) => ({
      user,
      facultyAcr: normalize(user.userID),
    }));
};

// Send email and save mail status
const sendPendingMailToRecipient = async ({
  application,
  recipient,
  targetType,
  facultyAcr = "",
}) => {
  const existingLog = await PendingMailLog.findOne({
    application: application._id,
    recipient: recipient._id,
    targetType,
    facultyAcr,
  });

  if (existingLog?.mailStatus === "Sent") return;

  const log = existingLog || await PendingMailLog.create({
    application: application._id,
    recipient: recipient._id,
    recipientEmail: recipient.email,
    targetType,
    facultyAcr,
    mailStatus: "Pending",
  });

  try {
    await sendEmail({
      to: recipient.email,
      subject: "Pending Special Exam Application",
      html: buildPendingMailHtml({
        application,
        recipient,
        targetType,
        facultyAcr,
      }),
    });

    log.mailStatus = "Sent";
    log.errorMessage = "";
    await log.save();
  } catch (error) {
    log.mailStatus = "Failed";
    log.errorMessage = error.message;
    await log.save();
    console.error("Pending mail send failed:", error.message);
  }
};

// Notify authority and faculty users
export const notifyPendingApplicationUsers = async (applicationId) => {
  try {
    const application = await StudentApplication.findById(applicationId);

    if (!application) {
      console.log("Application not found");
      return;
    }

    // Send mail to authority users
    if (application.authorityStatus === "Pending") {
      const authorityUsers = await getAuthorityRecipients(application);

      for (const authorityUser of authorityUsers) {
        await sendPendingMailToRecipient({
          application,
          recipient: authorityUser,
          targetType: "authority",
        });
      }
    }

    // Send mail to faculty users
    const facultyRecipients = await getFacultyRecipients(application);

    for (const item of facultyRecipients) {
      await sendPendingMailToRecipient({
        application,
        recipient: item.user,
        targetType: "faculty",
        facultyAcr: item.facultyAcr,
      });
    }
  } catch (error) {
    console.error("notifyPendingApplicationUsers error:", error);
  }
};