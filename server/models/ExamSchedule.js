import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      enum: ["CSE", "EEE", "BBA", "Law", "IT team"],
      required: true,
      unique: true, 
    },

    authority: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicationDeadlineDate: {
      type: Date,
      required: true,
    },

    applicationDeadlineText: {
      type: String,
      required: true,
      trim: true,
    },

    specialExamStartDate: {
      type: Date,
      required: true,
    },

    specialExamText: {
      type: String,
      required: true,
      trim: true,
    },

    applicationDeadlineEmailSent: {
      type: Boolean,
      default: false,
    },

    specialExamReminderEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);

export default ExamSchedule;