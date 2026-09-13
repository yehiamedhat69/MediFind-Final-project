const Pharmacy = require("../models/Pharmacy");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Add pharmacy
const addPharmacy = asyncHandler(async (req, res) => {
  const { name, address, phone, location } = req.body;

  if (!name || !address || !phone) {
    throw new AppError("Name, address and phone are required", 400);
  }

  const existing = await Pharmacy.findOne({ ownerId: req.user.id });
  if (existing) {
    throw new AppError("This account already owns a pharmacy", 409);
  }

  const pharmacy = await Pharmacy.create({
    name,
    address,
    phone,
    location,
    ownerId: req.user.id
  });

  res.status(201).json({
    success: true,
    message: "Pharmacy added successfully",
    pharmacy
  });
});

// Get one pharmacy
const getPharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }

  res.status(200).json({ success: true, pharmacy });
});

// Get all pharmacies
const getAllPharmacies = asyncHandler(async (req, res) => {
  const pharmacies = await Pharmacy.find();
  res.status(200).json({ success: true, data: pharmacies });
});

// Update pharmacy (owner only)
const updatePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }

  if (pharmacy.ownerId.toString() !== req.user.id) {
    throw new AppError("You are not allowed to update this pharmacy", 403);
  }

  const updated = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    message: "Pharmacy updated successfully",
    pharmacy: updated
  });
});

// Delete pharmacy (owner only)
const deletePharmacy = asyncHandler(async (req, res) => {
  const pharmacy = await Pharmacy.findById(req.params.id);

  if (!pharmacy) {
    throw new AppError("Pharmacy not found", 404);
  }

  if (pharmacy.ownerId.toString() !== req.user.id) {
    throw new AppError("You are not allowed to delete this pharmacy", 403);
  }

  await Pharmacy.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Pharmacy deleted successfully" });
});

module.exports = {
  addPharmacy,
  getPharmacy,
  getAllPharmacies,
  updatePharmacy,
  deletePharmacy
};