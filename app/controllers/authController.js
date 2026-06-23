import User from "../models/User.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400);
      throw new Error("Invalid request!");
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please enter email and password");
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error("Password should be more then 8 characters")
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.status(400);
      throw new Error("A user with this email already exists!!");
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
    res.status(500);
    throw new Error("Internal server error: ");
  }
};

const loginUser = async (req, res, next) => {
  try {
    if (!req.body) {
      res.status(400);
      throw new Error("Invalid request!");
    }

    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please enter email and password");
    }

    const user = await User.findOne({ email: email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401);
      throw new Error("Invalid credentials")
    }

    const payload = {
      user: {
        id: user._id,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      message: "Login Successful!!",
      token: token,
    });
  } catch (err) {
    console.error("Login error: ", err);
    next(err)
  }
};

export { registerUser, loginUser };
