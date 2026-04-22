import mongoose from "mongoose";

const routineSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now }
});

const Routine = mongoose.model("Routine", routineSchema);
export default Routine;