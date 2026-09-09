import StudentApplication from "../models/StudentApplication.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

const buildStudentApplicationLink = () => {
  const baseUrl = process.env.FRONTEND_URL || "https://spm-1-u37a.onrender.com";
  return `${baseUrl}/student-dashboard/current-application`;
};

const buildFacultyStatusRows = (facultyStatuses = [], courses = []) => {
  if (!facultyStatuses.length) {
    return `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #ddd;">No faculty status found</td>
      </tr>
    `;
  }

  return facultyStatuses
    .map((item) => {
      const facultyAcr = item.facultyAcr?.trim().toUpperCase() || "N/A";

      const facultyCourses = courses.filter(
        (course) =>
          course.facultyAcr?.trim().toUpperCase() === facultyAcr
      );

      if (!facultyCourses.length) {
        return `
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">${facultyAcr}</td>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">N/A</td>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">No course found</td>
            <td style="padding: 8px 12px; border: 1px solid #ddd;">${item.status || "Pending"}</td>
          </tr>
        `;
      }

      return facultyCourses
        .map((course, index) => {
          return `
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">
                ${index === 0 ? facultyAcr : ""}
              </td>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">
                ${course.courseId || "N/A"}
              </td>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">
                ${course.courseTitle || "N/A"}
              </td>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">
                ${index === 0 ? item.status || "Pending" : ""}
              </td>
            </tr>
          `;
        })
        .join("");
    })
    .join("");
};

const buildStudentStatusMailHtml = ({
  application,
  student,
  changedBy,
  changedRole,
  changedStatus,
}) => {
  const viewLink = buildStudentApplicationLink();

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Special Exam Application Status</h2>

      <p>Dear ${student.name || application.name || "Student"},</p>

      <p>Your special exam application status has been updated.</p>

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
          <td style="padding: 6px 12px;"><strong>Updated By:</strong></td>
          <td style="padding: 6px 12px;">${changedBy}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>Updated By:</strong></td>
          <td style="padding: 6px 12px;">${changedRole}</td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;"><strong>New Status:</strong></td>
          <td style="padding: 6px 12px;">${changedStatus}</td>
        </tr>
      </table>

      <h3>Authority Status</h3>

      <table style="border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 12px; border: 1px solid #ddd;"><strong>Authority</strong></td>
          <td style="padding: 8px 12px; border: 1px solid #ddd;">${application.authorityStatus}</td>
        </tr>
      </table>

      <h3>Faculty Course Wise Statuses</h3>

      <table style="border-collapse: collapse; margin-bottom: 16px;">
        <tr>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Faculty Acronym</th>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Course Code</th>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Course Title</th>
          <th style="padding: 8px 12px; border: 1px solid #ddd; text-align: left;">Status</th>
        </tr>

        ${buildFacultyStatusRows(application.facultyStatuses, application.courses)}
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

export const notifyStudentApplicationStatusChanged = async ({
  applicationId,
  changedByUserId,
  changedRole,
  changedStatus,
}) => {
  const application = await StudentApplication.findById(applicationId);

  if (!application) {
    return;
  }

  const student = await User.findById(application.user);

  if (!student || !student.email) {
    console.log("Student email not found. Status mail skipped.");
    return;
  }

  const changedByUser = await User.findById(changedByUserId);

  const changedBy =
    changedByUser?.name ||
    changedByUser?.userID ||
    changedRole ||
    "System";

  await sendEmail({
    to: student.email,
    subject: `Application Status Updated: ${changedStatus}`,
    html: buildStudentStatusMailHtml({
      application,
      student,
      changedBy,
      changedRole,
      changedStatus,
    }),
  });
};