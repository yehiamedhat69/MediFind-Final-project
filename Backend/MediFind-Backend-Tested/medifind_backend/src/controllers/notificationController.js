const Notification = require("../models/Notification");

// GET MY NOTIFICATIONS
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notifications = await Notification.find({ userId })
      .populate("reservationId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};


// MARK NOTIFICATION AS READ
const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOne({
      _id: req.params.id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};


module.exports = {
  getMyNotifications,
  markNotificationAsRead,
};