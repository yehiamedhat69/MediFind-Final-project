const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["user", "customer", "admin", "pharmacy"],    // ← أضف الـ enum ده
      default: "user",                         // ← القيمة الافتراضية
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);