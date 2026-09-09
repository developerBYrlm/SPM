import ExamSchedule from "../models/ExamSchedule.js";
import User from "../models/User.js";


const getAuthorityDepartment = async (req) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    throw new Error("Authenticated user not found on request");
  }

  const authorityUser = await User.findById(userId).select("department role");

  if (!authorityUser) {
    throw new Error("Authority user not found");
  }

  return authorityUser.department;
};

export const getExamSchedule = async (req, res) => {
  try {
    const department = await getAuthorityDepartment(req);

    const schedule = await ExamSchedule.findOne({ department });

    return res.json({
      success: true,
      schedule: schedule || null,
    });
  } catch (error) {
    console.error("Get exam schedule error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch exam schedule",
    });
  }
};

export const upsertExamSchedule = async (req, res) => {
  try {
    const department = await getAuthorityDepartment(req);

    const {
      applicationDeadlineDate,
      applicationDeadlineText,
      specialExamStartDate,
      specialExamText,
    } = req.body;

    const existingSchedule = await ExamSchedule.findOne({ department });

    const updatePayload = {
      department,
      authority: req.user?.id || req.user?._id,
      applicationDeadlineDate,
      applicationDeadlineText,
      specialExamStartDate,
      specialExamText,
    };

    if (
      !existingSchedule ||
      new Date(existingSchedule.applicationDeadlineDate).getTime() !==
        new Date(applicationDeadlineDate).getTime()
    ) {
      updatePayload.applicationDeadlineEmailSent = false;
    }

    if (
      !existingSchedule ||
      new Date(existingSchedule.specialExamStartDate).getTime() !==
        new Date(specialExamStartDate).getTime()
    ) {
      updatePayload.specialExamReminderEmailSent = false;
    }

    const schedule = await ExamSchedule.findOneAndUpdate(
      { department },
      { $set: updatePayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Exam schedule saved successfully",
      schedule,
    });
  } catch (error) {
    console.error("Save exam schedule error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to save exam schedule",
    });
  }
};