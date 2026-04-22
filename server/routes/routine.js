import express from 'express';
import { uploadRoutine, getLatestRoutine, deleteRoutine, upload } from '../controllers/routineControllers.js';

const router = express.Router();

router.post('/upload', upload.single('attachment'), uploadRoutine);
router.get('/latest', getLatestRoutine);
router.delete('/delete/:id', deleteRoutine);

export default router;