import User from "../models/User.js";
import { sendEmail } from "./emailService.js";

/**
 * Builds HTML table rows for application courses
 */
const buildCourseRows = (courses = []) => {
  if (!courses.length) {
    return `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">N/A</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">N/A</td>
      </tr>
    `;
  }

  return courses
    .map(
      (course) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${course.courseId || "N/A"}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${course.courseTitle || "N/A"}</td>
        <td style="padding: 8px 12px; border: 1px solid #e2e8f0;">${course.facultyAcr || "N/A"}</td>
      </tr>
    `
    )
    .join("");
};

/**
 * Builds the HTML email content for the Authority permission request
 */
const buildPermissionMailHtml = ({
  application,
  recipient,
  studentUser,
  specialExamCount,
  token,
}) => {
  const serverUrl =
    process.env.SERVER_URL ||
    process.env.BACKEND_URL ||
    "https://spm-1-u37a.onrender.com";

  const grantUrl = `${serverUrl}/api/student-application/grant-special-permission?token=${token}&appId=${application._id}`;

  const studentEmail =
    studentUser?.email || application.user?.email || "Not Provided";

  const attemptNumber = (Number(specialExamCount) || 5) + 1;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%); padding: 24px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">Special Examination Permission Request</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.95;">Student Attended 5+ Times Notice & Authorization</p>
      </div>

      <div style="padding: 28px;">
        <p style="font-size: 15px; margin-top: 0;">Respected <strong>${recipient.name || "Head of Department / Authority"}</strong>,</p>

        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; border-radius: 4px; margin-bottom: 22px;">
          <p style="margin: 0; font-size: 14px; color: #991b1b; font-weight: 600;">
            ⚠️ Student Has Participated in ${specialExamCount} Special Exams
          </p>
          <p style="margin: 6px 0 0; font-size: 13.5px; color: #7f1d1d;">
            This student has already attended ${specialExamCount} special examinations and is now submitting their <strong>${attemptNumber}th attempt</strong>.
            The student has been instructed: <em>"You already attend 5 times on special exam and now you meet on Head of department to approve your application with necessary documents IF you have!"</em>
          </p>
        </div>

        <h3 style="font-size: 15px; color: #334155; margin-bottom: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
          Student & Application Summary
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr>
            <td style="padding: 6px 12px; width: 35%; color: #64748b;"><strong>Student ID:</strong></td>
            <td style="padding: 6px 12px; font-weight: 600; color: #0f172a;">${application.studentId}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 6px 12px; color: #64748b;"><strong>Student Name:</strong></td>
            <td style="padding: 6px 12px; font-weight: 600; color: #0f172a;">${application.name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b;"><strong>Student Email:</strong></td>
            <td style="padding: 6px 12px; color: #2563eb;">${studentEmail}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 6px 12px; color: #64748b;"><strong>Department:</strong></td>
            <td style="padding: 6px 12px;">${application.department}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b;"><strong>Semester & Section:</strong></td>
            <td style="padding: 6px 12px;">${application.semester} (Section: ${application.section})</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 6px 12px; color: #64748b;"><strong>Missed Exam Type:</strong></td>
            <td style="padding: 6px 12px; text-transform: capitalize;">${application.missedExamType}</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b;"><strong>Times Attended:</strong></td>
            <td style="padding: 6px 12px; color: #dc2626; font-weight: 700;">${specialExamCount} Times (Applying for Attempt #${attemptNumber})</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 6px 12px; color: #64748b;"><strong>Total Fine:</strong></td>
            <td style="padding: 6px 12px; font-weight: 600;">${application.totalFine} BDT</td>
          </tr>
          <tr>
            <td style="padding: 6px 12px; color: #64748b; vertical-align: top;"><strong>Student's Reason:</strong></td>
            <td style="padding: 6px 12px; color: #334155; font-style: italic;">"${application.reason || "None specified"}"</td>
          </tr>
        </table>

        <h3 style="font-size: 15px; color: #334155; margin-bottom: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px;">
          Applied Missed Courses
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Course Code</th>
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Course Title</th>
              <th style="padding: 8px 12px; border: 1px solid #e2e8f0;">Faculty</th>
            </tr>
          </thead>
          <tbody>
            ${buildCourseRows(application.courses)}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <p style="margin: 0 0 16px; font-size: 14px; color: #475569;">
            If the student has met with you physically, presented valid justifications, and you authorize them to attend, please click the button below to grant permission:
          </p>

          <a href="${grantUrl}" target="_blank" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 6px; display: inline-block; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);">
            Approve Special Permission
          </a>

          <p style="margin: 14px 0 0; font-size: 12.5px; color: #64748b;">
            Once permission is granted, this application will automatically be sorted into your <strong>Authority Pending List</strong> on the Special Exam Dashboard for final review and approval.
          </p>
        </div>

        <p style="font-size: 12.5px; color: #94a3b8; margin: 0; text-align: center;">
          This is an automated notification from the Special Exam Management System.
        </p>
      </div>
    </div>
  `;
};

/**
 * Sends special permission email to department authority when student has attended 5+ times
 */
export const notifyAuthoritySpecialPermission = async ({
  application,
  studentUser,
  specialExamCount,
  token,
}) => {
  try {
    if (!application || !token) {
      console.error("notifyAuthoritySpecialPermission: Missing application or token");
      return;
    }

    // Find authority of the same department
    let authorityUsers = await User.find({
      department: application.department,
      role: "authority",
      email: { $exists: true, $ne: "" },
    });

    // Fallback: If no authority for this department, find all authorities
    if (!authorityUsers.length) {
      authorityUsers = await User.find({
        role: "authority",
        email: { $exists: true, $ne: "" },
      });
    }

    if (!authorityUsers.length) {
      console.warn(
        `No authority found to receive special permission mail for department ${application.department}`
      );
      return;
    }

    const subject = `${application.studentId} need special exam permission request`;

    for (const authorityUser of authorityUsers) {
      try {
        const html = buildPermissionMailHtml({
          application,
          recipient: authorityUser,
          studentUser,
          specialExamCount,
          token,
        });

        await sendEmail({
          to: authorityUser.email,
          subject,
          html,
        });

        console.log(
          `Special permission email sent to authority ${authorityUser.email} for student ${application.studentId}`
        );
      } catch (err) {
        console.error(
          `Failed sending special permission email to authority ${authorityUser.email}:`,
          err.message
        );
      }
    }
  } catch (error) {
    console.error("notifyAuthoritySpecialPermission error:", error);
  }
};

export default notifyAuthoritySpecialPermission;
