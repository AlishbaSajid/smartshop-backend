const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";
const RESET_TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes

// ✅ Register User (customer or provider)
async function registerUser(req, res) {
  try {
    const { name, email, password, confirmPassword, role } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (role === "admin") {
    return res.status(403).json({ error: "You cannot register as admin" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashPassword,
      role, // ✅ customer or provider
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// ✅ Login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 🔒 Check if user is blocked
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account has been blocked. Please contact support." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // ✅ important for auth guard
      },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}

// ✅ Forgot Password
async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate reset token
        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: RESET_TOKEN_EXPIRY });

        // Update user in the database
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY * 1000);
        
        await user.save();  // ✅ Ensure this is executed

        // Send email
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Password Reset",
            text: `Click the link to reset your password: http://localhost:4200/reset-password/${token}`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Reset link sent to email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}

// ✅ Reset Password
async function resetPassword(req, res) {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        
        // Check if both passwords match
         if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
        }

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Find user by ID
        const user = await User.findById(decoded.id);
        if (!user || user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Remove reset token after use
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(400).json({ message: "Invalid or expired token", error });
    }
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
