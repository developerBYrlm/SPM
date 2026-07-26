import mongoose, { Schema } from "mongoose";
 

const studentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    studentId: {
      type: String,
      required: true,
      unique: true
    }, 

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true
    },

    phone: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
