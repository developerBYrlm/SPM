import mongoose from "mongoose";
 
const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    email: { type: String, required: true },
    password: { type: String, required: true },
    userID: { type: String, required: true },

    role: { 
        type: String, 
        enum: ["authority", "student", "faculty", "ACAD"], 
        required: true 
    },
    department: { 
        type: String, 
        enum: ["CSE", "EEE", "BBA", "Law"], 
        required: true 
    },

    profileImage: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
