// ১. সবার আগে dotenv লোড করতে হবে
import dotenv from 'dotenv';
dotenv.config(); 

// ২. এরপর বাকি ইম্পোর্টগুলো করতে হবে
import User from './models/User.js';
import bcrypt from 'bcrypt';
import connectToDatabase from './db/db.js';

const userRegister = async () => {
  try {
    // চেক করার জন্য: URL ঠিকমতো লোড হচ্ছে কি না
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL is missing! Check your .env file location.");
      return;
    }

    await connectToDatabase();

    const hashPassword = await bcrypt.hash("authority", 10);

    // অবজেক্টটি সরাসরি নিউ ইউজার হিসেবে ডিক্লেয়ার করা
    const newUser = new User({
      name: "authority",
      email: "authority@gmail.com",
      userID: "991969",
      password: hashPassword,
      role: "authority",      
      department: "CSE" 
    });

    await newUser.save();
    console.log("✅ Authority user created successfully in SpecialXm");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error encountered:", error.message);
    if (error.errors) {
        console.error("Validation details:", Object.keys(error.errors));
    }
    process.exit(1);
  }
};

userRegister();