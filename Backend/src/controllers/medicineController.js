const Medicine = require("../models/medicine");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

// Add medicine
const addMedicine = asyncHandler(async (req, res) => {
  const { name, description = "", category = "", genericName } = req.body;

  if (!name || !String(name).trim()) {
    throw new AppError("Medicine name is required", 400);
  }

  const existingMedicine = await Medicine.findOne({ name: String(name).trim() });
  if (existingMedicine) {
    throw new AppError("Medicine already exists", 409);
  }

  const medicine = await Medicine.create({
    name: String(name).trim(),
    description: String(description).trim(),
    category: String(category).trim(),
    ...(genericName ? { genericName: String(genericName).trim() } : {}),
  });

  res.status(201).json({
    success: true,
    message: "Medicine added successfully",
    medicine
  });
});

// Get one medicine
const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  res.status(200).json({ success: true, medicine });
});

// Get all medicines (supports search, filter, pagination)
const getAllMedicines = asyncHandler(async (req, res) => {
  const { name, category, page = 1, limit = 10 } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  if (isNaN(pageNumber) || pageNumber < 1) {
    throw new AppError("Page must be a positive number", 400);
  }

  if (isNaN(limitNumber) || limitNumber < 1) {
    throw new AppError("Limit must be a positive number", 400);
  }

  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (category) {
    query.category = { $regex: `^${category}$`, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [medicines, totalCount] = await Promise.all([
    Medicine.find(query).skip(skip).limit(limitNumber),
    Medicine.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: medicines,
    pagination: {
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalItems: totalCount,
      itemsPerPage: limitNumber
    }
  });
});

// Update medicine
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Medicine updated successfully",
    medicine
  });
});

// Delete medicine
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    throw new AppError("Medicine not found", 404);
  }

  res.status(200).json({ success: true, message: "Medicine deleted successfully" });
});

module.exports = {
  addMedicine,
  getMedicine,
  getAllMedicines,
  updateMedicine,
  deleteMedicine
};