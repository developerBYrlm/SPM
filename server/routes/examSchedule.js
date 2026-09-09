import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import {
  getExamSchedule,
  upsertExamSchedule,
} from "../controllers/examScheduleController.js";

const router = express.Router();

router.get("/", authMiddleware, getExamSchedule);
router.post("/", authMiddleware, upsertExamSchedule);

export default router;