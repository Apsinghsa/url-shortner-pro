import User from "../models/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name email and password!!",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!!",
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        messasge: "A user with this email already exists!!",
      });
    }

    // Hashing the password

    const salt = await bcrypt.genSalt(10);

    const hashedPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPass,
    });

    res.status(201).json({
      success: true,
      message: "User Registered!! :) !!",
    });
  } catch (err) {
    console.error("Registration error : ", err);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error!! :( !!" });
  }
};

const loginUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Invalid Request!!",
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password!!",
      });
    }

    const user = await User.findOne({ email: email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials!!" });
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      message: "Login Successful!!",
      token: token,
    });
  } catch (err) {
    console.error("Login error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Internal server error!! :( !!" });
  }
};

export { registerUser, loginUser };
