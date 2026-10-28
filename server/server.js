require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/monochrome_auth";
const JWT_SECRET = process.env.JWT_SECRET || "local-learning-demo-secret-change-me";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

function createToken(user) {
  return jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "2h" });
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "The API is running." });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: "Name must be between 2 and 60 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists. Try logging in." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    return res.status(201).json({
      message: "Your account has been created successfully.",
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password) {
      return res.status(400).json({ message: "Enter both your email and password." });
    }

    const user = await User.findOne({ email });
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!passwordMatches) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    return res.json({
      message: `Welcome back, ${user.name}!`,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to local MongoDB:", MONGODB_URI);
    app.listen(PORT, () => console.log(`API listening at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Could not connect to MongoDB.");
    console.error("Check that MongoDB Server is running at:", MONGODB_URI);
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
