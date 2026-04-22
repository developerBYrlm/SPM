import express from "express";
import {  
    applyStudentApplication, 
    getAllApplications,  
    getApplicationById,   
    removeApplication, 
    upload, 
    getMyApplication,
    updateApplicationStatus,
    updateConsiderAmount
 } from "../controllers/studentApplicationController.js";

    
import authMiddleware from "../middleware/authMiddlware.js"
import { UpdateStudentApplication, uploadUpdatePDF } from "../controllers/UpdateControllers/studentApplicationUpdateController.js";
const router = express.Router();

router.post( "/apply", authMiddleware, upload.single("attachment"), applyStudentApplication );
router.get("/", authMiddleware, getAllApplications);
router.get("/application-view/:id",authMiddleware,  getApplicationById);
router.delete("/application-remove/:id", authMiddleware, removeApplication);

router.put("/update-status/:id", authMiddleware, updateApplicationStatus);

router.put( "/application-update", authMiddleware, uploadUpdatePDF.single("attachment"), UpdateStudentApplication)

router.put("/update-consider-amount/:id", authMiddleware, updateConsiderAmount);

router.get("/my-application", authMiddleware, getMyApplication);

export default router;
