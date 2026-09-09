import dotenv from 'dotenv';
dotenv.config(); 

import User from './models/User.js';
import bcrypt from 'bcrypt';
import connectToDatabase from './db/db.js';

const userRegister = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("❌ MONGODB_URL is missing! Check your .env file location.");
      return;
    }

    await connectToDatabase();

    const hashPassword = await bcrypt.hash("superRLM", 10);

    const newUser = new User({
      name: "Super Admin",
      email: "superAdmin@gmail.com",
      userID: "cse111",
      password: hashPassword,
      role: "IT",      
      department: "Developer" 
    });

    await newUser.save();
    console.log(" Authority user created successfully in SpecialXm");
    process.exit(0);

  } catch (error) {
    console.error(" Error encountered:", error.message);
    if (error.errors) {
        console.error("Validation details:", Object.keys(error.errors));
    }
    process.exit(1);
  }
};

userRegister();