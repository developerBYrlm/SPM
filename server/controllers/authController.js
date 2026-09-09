import User from "../models/User.js";
import Student from "../models/student.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import createMailTransporter from "../utils/mailTransporter.js";

const maskEmail = (email) => {
  const [name, domain] = email.split("@");

  if (!name || !domain) return email;

  const visiblePart = name.slice(0, 2);
  const hiddenPart = "*".repeat(Math.max(name.length - 2, 3));

  return `${visiblePart}${hiddenPart}@${domain}`;
};

const sendOtpEmail = async ({ to, otp }) => {
  const transporter = createMailTransporter();

  const fromName =
    process.env.MAIL_FROM_NAME || "Special Exam Application System";

  const fromEmail =
    process.env.MAIL_FROM_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset OTP</h2>

        <p>Your password reset OTP is:</p>

        <h1 style="letter-spacing: 4px;">${otp}</h1>

        <p>This OTP is valid for <b>1 minute</b>.</p>

        <p>If you did not request this, please ignore this email.</p>

        <br />
        <p><br />Special Exam Application System</p>
      </div>
    `,
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Wrong Password!!!",
      });
    }

    const studentProfile = await Student.findOne({ user: user._id });

    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role,
      },
      process.env.JWT_KEY,
      {
        expiresIn: "10d",
      }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        studentId: studentProfile ? studentProfile._id : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const verify = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

const sendPasswordResetOtp = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({
        success: false,
        error: "ID / Acronym is required",
      });
    }

    const user = await User.findOne({
      userID: studentId.trim(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No user found with this ID / Acronym",
      });
    }

    if (!user.email) {
      return res.status(400).json({
        success: false,
        error: "No email linked with this account",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    await PasswordResetOTP.deleteMany({
      user: user._id,
    });

    await PasswordResetOTP.create({
      user: user._id,
      otpHash,
      expiresAt: new Date(Date.now() + 60 * 1000),
      verified: false,
    });

    await sendOtpEmail({
      to: user.email,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
      emailHint: maskEmail(user.email),
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while sending OTP",
    });
  }
};

const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is missing",
      });
    }

    if (!otp || !otp.trim()) {
      return res.status(400).json({
        success: false,
        error: "OTP is required",
      });
    }

    if (otp.trim().length !== 6) {
      return res.status(400).json({
        success: false,
        error: "OTP must be 6 digits",
      });
    }

    const otpRecord = await PasswordResetOTP.findOne({
      user: userId,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: "OTP not found. Please send OTP again.",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await PasswordResetOTP.deleteMany({
        user: userId,
      });

      return res.status(400).json({
        success: false,
        error: "OTP expired. Please send OTP again.",
      });
    }

    const isOtpMatch = await bcrypt.compare(otp.trim(), otpRecord.otpHash);

    if (!isOtpMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Try again.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    otpRecord.verified = true;
    otpRecord.resetToken = resetToken;
    otpRecord.resetTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while verifying OTP",
    });
  }
};

const updatePasswordAfterOtp = async (req, res) => {
  try {
    const { userId, resetToken, password } = req.body;

    if (!userId || !resetToken) {
      return res.status(400).json({
        success: false,
        error: "Invalid password reset request",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    const otpRecord = await PasswordResetOTP.findOne({
      user: userId,
      resetToken,
      verified: true,
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: "OTP verification required",
      });
    }

    if (
      !otpRecord.resetTokenExpiresAt ||
      otpRecord.resetTokenExpiresAt < new Date()
    ) {
      await PasswordResetOTP.deleteMany({
        user: userId,
      });

      return res.status(400).json({
        success: false,
        error: "Password reset session expired. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    await PasswordResetOTP.deleteMany({
      user: userId,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error while updating password",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, studentId, phone, password } = req.body;

    const user = await User.findOne({
      email,
      userID: studentId,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found with these details",
      });
    }

    const profile = await Student.findOne({
      user: user._id,
      phone,
    });

    if (!profile) {
      return res.status(401).json({
        success: false,
        error: "Phone number does not match",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Server error during password reset",
    });
  }
};

export {
  login,
  verify,
  getMe,
  resetPassword,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  updatePasswordAfterOtp,
};