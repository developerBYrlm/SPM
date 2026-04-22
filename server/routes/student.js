import express from "express"
import authMiddleware from "../middleware/authMiddlware.js"
import { addStudent, upload, getStudents, getStudent, removeStudent } from "../controllers/studentController.js"
import { updateStudent, uploadUpdate } from "../controllers/UpdateControllers/studentInfoUpdate.js"

const router = express.Router()
  

router.get('/', authMiddleware, getStudents)  // get student from DB
router.post("/add", authMiddleware, upload.single("image"), addStudent)  //add student into DB
router.get('/view/:id', authMiddleware, getStudent) // get singly student details info
router.post("/edit/:id", authMiddleware, uploadUpdate.single("image"), updateStudent) // update student info
router.delete("/remove/:id", authMiddleware, removeStudent) // remove student from DB


export default router
  

