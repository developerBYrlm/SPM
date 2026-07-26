import mongoose, { Schema } from "mongoose";

const studentApplicationSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  studentId: { type: String, required: true },
  name: { type: String, required: true },

  missedExamType: { type: String, required: true },
  missedExamDate: { type: Date, required: true },

  semester: { type: String, required: true },
  section: { type: String, required: true },
  reason: { type: String, required: true },

  department: {
    type: String,
    enum: ["CSE", "EEE", "BBA", "Law"],
    required: true
  },

  courses: [
    {
      courseTitle: String,
      facultyAcr: String,
      courseId: String,
      missedExamDate: Date,
      fine: Number
    }
  ],

  facultyStatuses: [
    {
      facultyAcr: { type: String, required: true },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
      }
    }
  ],

  totalFine: { type: Number, default: 0 },
  attachment: { type: String },

  authorityStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  createdAt: { type: Date, default: Date.now }
});

const StudentApplication =  mongoose.models.StudentApplication ||  mongoose.model("StudentApplication", studentApplicationSchema);
export default StudentApplication;