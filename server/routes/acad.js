import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import { getAcads, getAcad, removeAcad} from "../controllers/acadControllers.js";
import { updateAcad, uploadUpdate } from "../controllers/UpdateControllers/acadInfoUpdate.js";
const router = express.Router();

router.get('/', authMiddleware, getAcads);
router.get('/acad-view/:id', authMiddleware, getAcad);
router.post("/acad-edit/:id", authMiddleware, uploadUpdate.single("image"), updateAcad);
router.delete("/acad-remove/:id", authMiddleware, removeAcad);

export default router;
