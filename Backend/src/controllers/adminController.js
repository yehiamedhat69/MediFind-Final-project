const User = require("../models/user");
const Pharmacy = require("../models/Pharmacy");
const Reservation = require("../models/Reservation");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// ===== USERS =====

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, data: users });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (role && !["user", "customer", "admin", "pharmacy"].includes(role)) {
    throw new AppError("Invalid role value", 400);
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.status(200).json({ success: true, message: "User updated successfully", data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

// ===== PHARMACIES =====

const getAllPharmaciesAdmin = asyncHandler(async (req, res) => {
  const pharmacies = await Pharmacy.find();
  res.status(200).json({ success: true, data: pharmacies });
});

const updatePharmacyAdmin = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }
  res.status(200).json({ success: true, message: "Pharmacy updated successfully", data: pharmacy });
});

const deletePharmacyAdmin = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }
  res.status(200).json({ success: true, message: "Pharmacy deleted successfully" });
});

// ===== RESERVATIONS =====

const getAllReservationsAdmin = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find()
    .populate("customerId", "username email")
    .populate("medicineId", "name category")
    .populate("pharmacyId", "name address");
  res.status(200).json({ success: true, data: reservations });
});

const deleteReservationAdmin = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findByIdAndDelete(req.params.id);
  if (!reservation) {
    throw new AppError("Reservation not found", 404);
  }
  res.status(200).json({ success: true, message: "Reservation deleted successfully" });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllPharmaciesAdmin,
  updatePharmacyAdmin,
  deletePharmacyAdmin,
  getAllReservationsAdmin,
  deleteReservationAdmin
};