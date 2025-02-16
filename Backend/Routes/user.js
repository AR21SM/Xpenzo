const express = require("express");
const router = express.Router();
const zod = require("zod");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const authMiddleware = require("../middleware");

const signupSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string().min(2),
    lastName: zod.string().min(2),
    password: zod.string().min(6),
});

router.post("/signup", async (req, res) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0].message });
        }

        const { username, firstName, lastName, password } = req.body;

        if (await User.findOne({ username })) {
            return res.status(409).json({ message: "This email is already registered. Try signing in instead." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, firstName, lastName, password: hashedPassword });

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "7d" });

        return res.status(201).json({ message: "Account created successfully!", token });
    } catch {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const signinSchema = zod.object({
    username: zod.string().email(),
    password: zod.string(),
});

router.post("/signin", async (req, res) => {
    try {
        const parsed = signinSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0].message });
        }

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Incorrect email or password. Please try again." });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

        return res.json({ message: "Login successful!", token });
    } catch {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const updateSchema = zod.object({
    password: zod.string().min(6).optional(),
    firstName: zod.string().min(2).optional(),
    lastName: zod.string().min(2).optional(),
});

router.put("/update", authMiddleware, async (req, res) => {
    try {
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input. Please check your details." });
        }

        const { password, firstName, lastName } = req.body;
        const updateData = { firstName, lastName };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.updateOne({ _id: req.userId }, updateData);

        return res.json({ message: "Profile updated successfully." });
    } catch {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const regexFilter = new RegExp(filter, "i");

        const users = await User.find({
            $or: [{ firstName: regexFilter }, { lastName: regexFilter }],
        }).select("username firstName lastName _id");

        return res.json({ users });
    } catch {
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
