import Routine from "../models/Routine.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/routines");
    },
    filename: (req, file, cb) => {
        cb(null, "routine_" + Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage });

// 1. Routine Upload 
export const uploadRoutine = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: "No file uploaded" });
        }
        
        // Save to Database
        const newRoutine = new Routine({
            filename: req.file.filename
        });

        await newRoutine.save();
        res.status(200).json({ success: true, routine: newRoutine });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 2. View Routine
export const getLatestRoutine = async (req, res) => {
    try {
        const routine = await Routine.findOne().sort({ uploadDate: -1 });
        if (!routine) {
            return res.status(404).json({ success: false, error: "No routine found" });
        }
        res.status(200).json({ success: true, routine });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Delete Routine 
export const deleteRoutine = async (req, res) => {
    try {
        const { id } = req.params;
        const routine = await Routine.findById(id);

        if (!routine) {
            return res.status(404).json({ success: false, error: "Routine not found" });
        }

        // 1. Folder theke file delete kora
        const filePath = path.join("uploads/routines", routine.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 2. Database theke record delete kora
        await Routine.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Routine deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};