import mongoose from "mongoose";

const passwordResetOTPSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },

    verified: {
      type: Boolean,
      default: false,
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const PasswordResetOTP = mongoose.model(
  "PasswordResetOTP",
  passwordResetOTPSchema
);

export default PasswordResetOTP;