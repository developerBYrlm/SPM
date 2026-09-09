import express from "express";
import authMiddleware from "../middleware/authMiddlware.js";
import { getITUsers, getITUser, removeITUser,} from "../controllers/itController.js";
import { updateIT, uploadUpdate, } from "../controllers/UpdateControllers/itInfoUpdate.js";

const router = express.Router();

router.get( "/", authMiddleware, getITUsers);
router.get("/it-view/:id", authMiddleware, getITUser);
router.post( "/it-edit/:id", authMiddleware, uploadUpdate.single("image"), updateIT);
router.delete( "/it-remove/:id", authMiddleware, removeITUser);

export default router;