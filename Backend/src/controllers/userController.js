const User = require("../models/user");
// GET CURRENT USER PROFILE
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// UPDATE CURRENT USER PROFILE
const updateMyProfile = async (req, res) => {
  try {
    const { username, email, role, password, _id, id } = req.body;

    // Prevent protected fields from being modified
    if (role !== undefined || password !== undefined || _id !== undefined || id !== undefined) {
      return res.status(403).json({
        message: "You cannot modify protected fields",
      });
    }

    // Only allow username and email to be updated
    const updates = {};

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        return res.status(400).json({
          message: "Username must be at least 3 characters",
        });
      }

      updates.username = username.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({
          message: "A valid email is required",
        });
      }

      updates.email = email.trim().toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // Check if another user already uses the username
    if (updates.username) {
      const existingUsername = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user.id },
      });

      if (existingUsername) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }
    }

    // Check if another user already uses the email
    if (updates.email) {
      const existingEmail = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
};