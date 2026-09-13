const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
} = require("../controllers/userController");

const router = express.Router();

// Get current user's profile
router.get("/me", authenticateToken, getMyProfile);

// Update current user's profile
router.patch("/me", authenticateToken, updateMyProfile);

module.exports = router;