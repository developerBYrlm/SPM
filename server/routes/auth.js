import express from "express";

import {
  login,
  resetPassword,
  verify,
  getMe,
  sendPasswordResetOtp,
  verifyPasswordResetOtp,
  updatePasswordAfterOtp,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddlware.js";

const route = express.Router();

route.post("/login", login);

route.get("/verify", authMiddleware, verify);
route.post("/verify", authMiddleware, verify);

route.get("/me", authMiddleware, getMe);

route.post("/reset-password", resetPassword);

route.post("/forgot-password/send-otp", sendPasswordResetOtp);
route.post("/forgot-password/verify-otp", verifyPasswordResetOtp);
route.post("/forgot-password/update-password", updatePasswordAfterOtp);

export default route;