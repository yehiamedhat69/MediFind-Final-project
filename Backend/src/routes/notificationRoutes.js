const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

// Get authenticated user's notifications
router.get(
  "/",
  authenticateToken,
  getMyNotifications
);

// Mark notification as read
router.patch(
  "/:id/read",
  authenticateToken,
  markNotificationAsRead
);

module.exports = router;