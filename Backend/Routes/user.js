
const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");


const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string().min(2, "First name must be at least 2 characters"),
    lastName: zod.string().min(2, "Last name must be at least 2 characters"),
    password: zod.string().min(6, "Password must be at least 6 characters"),
});



router.post("/signup", async (req, res) => {
    const { success, error } = signupBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: error.issues[0].message || "Invalid input. Please check your details.",
        });
    }

    const existingUser = await User.findOne({ username: req.body.username });

    if (existingUser) {
        return res.status(409).json({
            message: "This email is already registered. Try signing in instead.",
        });
    }

    const user = await User.create(req.body);
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
        message: "Account created successfully! Welcome aboard.",
        token,
    });
});

// Schema validation
const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

// User Signin
router.post("/signin", async (req, res) => {
    const { success, error } = signinBody.safeParse(req.body);
    if (!success) {
        return res.status(400).json({
            message: error.issues[0].message || "Invalid credentials. Please try again.",
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    });

    if (!user) {
        return res.status(401).json({
            message: "Incorrect email or password. Please try again.",
        });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
        message: "Login successful. Welcome back!",
        token,
    });
});

module.exports = router;
