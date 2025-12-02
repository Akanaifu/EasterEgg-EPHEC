import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Admin login
router.post("/login", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Login successful",
      token: "admin-token-placeholder", // In production, use JWT
    });
  }

  return res.status(401).json({ error: "Invalid password" });
});

export default router;
