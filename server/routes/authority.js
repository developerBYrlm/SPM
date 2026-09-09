import express from "express"
import authMiddleware from "../middleware/authMiddlware.js"
import { getAuthority, getAuthoritys, removeAuthority } from "../controllers/authorityControllers.js"
import { updateAuthority, uploadUpdate } from "../controllers/UpdateControllers/authorityInfoUpdate.js"

const router = express.Router()

router.get("/", authMiddleware, getAuthoritys);
router.get('/authority-view/:id', authMiddleware, getAuthority) 
router.post('/authority-edit/:id', authMiddleware, uploadUpdate.single("image"), updateAuthority)
router.delete("/authority-remove/:id", authMiddleware, removeAuthority)



export default router;