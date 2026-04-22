import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in .env file");
        }
        await mongoose.connect(process.env.MONGODB_URL); 
        console.log("MongoDB Connected Successfully to SpecialExamm");
    } catch (error) {
        console.error(" Database Connection Error:", error.message);
        process.exit(1); 
    }
};

export default connectToDatabase;