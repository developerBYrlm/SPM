import mongoose, { Schema } from "mongoose";

const pendingMailLogSchema = new mongoose.Schema(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: "StudentApplication",
      required: true,
    },

    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
    },

    targetType: {
      type: String,
      enum: ["authority", "faculty"],
      required: true,
    },

    facultyAcr: {
      type: String,
      default: "",
    },

    mailStatus: {
      type: String,
      enum: ["Pending", "Sent", "Failed"],
      default: "Pending",
    },

    errorMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

pendingMailLogSchema.index(
  {
    application: 1,
    recipient: 1,
    targetType: 1,
    facultyAcr: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("PendingMailLog", pendingMailLogSchema);