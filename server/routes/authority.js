import express from "express"
import authMiddleware from "../middleware/authMiddlware.js"
import { getAuthority } from "../controllers/authorityControllers.js"
import { updateAuthority, uploadUpdate } from "../controllers/UpdateControllers/authorityInfoUpdate.js"

const router = express.Router()

router.get('/authority-view/:id', authMiddleware, getAuthority) 
router.post('/authority-edit/:id', authMiddleware, uploadUpdate.single("image"), updateAuthority)


export default router;