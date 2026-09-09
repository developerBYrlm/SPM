import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import dns from "dns";

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

import connectToDatabase from "./db/db.js";

// Routes
import authRouter from "./routes/auth.js";
import authorityRouter from "./routes/authority.js";
import itRouter from "./routes/it.js";
import studentRouter from "./routes/student.js";
import facultyRouter from "./routes/faculty.js";
import acadRouter from "./routes/acad.js";
import studentApplicationRouter from "./routes/studentApplication.js";
import routineRouter from "./routes/routine.js";
import examScheduleRouter from "./routes/examSchedule.js";
import startExamScheduleMailJob from "./jobs/examScheduleMailJob.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static folders
app.use("/imageUploads/uploads", express.static(path.join("imageUploads/uploads")));
app.use("/uploads/studentApplications", express.static(path.join("uploads/studentApplications")));
app.use("/uploads", express.static("uploads"));
app.use("/uploads/routines", express.static("uploads/routines"));

// Connect to MongoDB
connectToDatabase();

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/authority", authorityRouter);
app.use("/api/it", itRouter);
app.use("/api/students", studentRouter);
app.use("/api/faculty", facultyRouter);
app.use("/api/acad", acadRouter);
app.use("/api/student-application", studentApplicationRouter);
app.use("/api/routine", routineRouter);
app.use("/api/exam-schedule", examScheduleRouter);

// Start mail job
startExamScheduleMailJob();

// Start Server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Server is running on port => " + PORT);
});