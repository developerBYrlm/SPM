import User from '../models/User.js'
import Student from '../models/Student.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'; 

const login = async (req, res) => { 
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not Found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: "Wrong Password!!!" });
        }

        const studentProfile = await Student.findOne({ user: user._id });

        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "10d" }
        );

        return res.status(200).json({
            success: true,
            token,
            user: { _id: user._id, name: user.name, role: user.role, 
                   studentId: studentProfile ? studentProfile._id : null
             }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const verify = (req, res) => {
    return res.status(200).json({success: true, user: req.user})
}


 const resetPassword = async (req, res) => {
    try {
        const { email, studentId, phone, password } = req.body;

        // ck user details from student
        const user = await User.findOne({ email, userID: studentId });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found with these details" });
        }

        // from User
        const profile = await Student.findOne({ user: user._id, phone: phone });
        if (!profile) {
            return res.status(401).json({ success: false, error: "Phone number does not match" });
        }

        // create new pass
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // update pass
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        return res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: "Server error during password reset" });
    }
};

const getMe = async (req, res) => {
  try {
    const user = req.user; 
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};


export {login, verify, resetPassword, getMe};