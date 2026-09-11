import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Token not provided"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Find user without password
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    // Add user data to request
    req.user = user;
    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};

export default authMiddleware;