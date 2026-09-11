import cron from "node-cron";
import ExamSchedule from "../models/ExamSchedule.js";
import User from "../models/User.js";
import createMailTransporter from "../utils/mailTransporter.js";

// Check if two dates are the same
const isSameDate = (dateOne, dateTwo) => (
  dateOne.getFullYear() === dateTwo.getFullYear() &&
  dateOne.getMonth() === dateTwo.getMonth() &&
  dateOne.getDate() === dateTwo.getDate()
);

// Get date before the given date
const getBeforeDate = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

// Send email to department students
const sendMailToStudents = async ({ department, subject, message }) => {
  const students = await User.find({
    role: "student",
    department,
    email: { $exists: true, $ne: "" },
  }).select("name email");

  if (!students.length) {
    console.log(`No student emails found for department: ${department}`);
    return;
  }

  const transporter = createMailTransporter();

  for (const student of students) {
    try {
      await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME || "Authority"}" <${process.env.SMTP_USER}>`,
        to: student.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${subject}</h2>
            <p>Dear ${student.name || "Student"},</p>
            <p>${message}</p>
            <br />
            <p>Regards,</p>
            <p>${process.env.MAIL_FROM_NAME || "Authority"}</p>
          </div>
        `,
      });

      console.log(`Mail sent to ${student.email} (${department})`);
    } catch (error) {
      console.error(`Failed to send mail to ${student.email}:`, error.message);
    }
  }
};

// Check schedules and send reminder emails
const checkExamScheduleAndSendMail = async () => {
  try {
    const schedules = await ExamSchedule.find();
    if (!schedules.length) return;

    const today = new Date();

    for (const schedule of schedules) {
      const deadlineReminderDate = getBeforeDate(
        schedule.applicationDeadlineDate,
        1
      );
      const specialExamReminderDate = getBeforeDate(
        schedule.specialExamStartDate,
        2
      );

      // Send application deadline reminder
      if (
        isSameDate(today, deadlineReminderDate) &&
        !schedule.applicationDeadlineEmailSent
      ) {
        await sendMailToStudents({
          department: schedule.department,
          subject: "Application Deadline Notice (Reminder)",
          message: schedule.applicationDeadlineText,
        });

        schedule.applicationDeadlineEmailSent = true;
        await schedule.save();

        console.log(
          `Application deadline reminder emails sent for ${schedule.department}`
        );
      }

      // Send special exam reminder
      if (
        isSameDate(today, specialExamReminderDate) &&
        !schedule.specialExamReminderEmailSent
      ) {
        await sendMailToStudents({
          department: schedule.department,
          subject: "Special Exam Start Reminder",
          message: schedule.specialExamText,
        });

        schedule.specialExamReminderEmailSent = true;
        await schedule.save();

        console.log(
          `Special exam reminder emails sent for ${schedule.department}`
        );
      }
    }
  } catch (error) {
    console.error("Exam schedule mail job error:", error);
  }
};

// Start cron job
const startExamScheduleMailJob = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Checking exam schedule mail job...");
    await checkExamScheduleAndSendMail();
  });

  console.log("Exam schedule mail job started");
};

export default startExamScheduleMailJob;