import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import { getFacultys, getFaculty, removeFaculty} from "../controllers/facultyController.js";
import {updateFaculty, uploadUpdate} from "../controllers/UpdateControllers/facultyInfoUpdate.js"

const router = express.Router();

router.get("/", authMiddleware, getFacultys);
router.get('/faculty-view/:id', authMiddleware, getFaculty);
router.post("/faculty-edit/:id", authMiddleware, uploadUpdate.single("image"), updateFaculty);
router.delete("/faculty-remove/:id", authMiddleware, removeFaculty)
export default router;
     