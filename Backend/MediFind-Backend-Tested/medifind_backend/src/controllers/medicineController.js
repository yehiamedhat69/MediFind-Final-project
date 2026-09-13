const Medicine = require("../models/medicine");

// Add medicine
const addMedicine = async (req, res) => {
  try {
    const { name, description, price, quantity, expiryDate, category } = req.body;

    const existingMedicine = await Medicine.findOne({ name });

    if (existingMedicine) {
      return res.status(409).json({
        message: "Medicine already exists"
      });
    }

    const medicine = await Medicine.create({
      name,
      description,
      price,
      quantity,
      expiryDate,
      category
    });

    res.status(201).json({
      message: "Medicine added successfully",
      medicine
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add medicine",
      error: error.message
    });
  }
};

// Get one medicine
const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    res.status(200).json(medicine);
  } catch (error) {
    res.status(400).json({
      message: "Invalid medicine ID"
    });
  }
};

// Get all medicines (supports search, filter, pagination)
const getAllMedicines = async (req, res) => {
  try {
    const { name, category, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // basic validation
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive number"
      });
    }

    if (isNaN(limitNumber) || limitNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "Limit must be a positive number"
      });
    }

    // build search/filter query
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve medicines",
      error: error.message
    });
  }
};

// Update medicine
const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    res.status(200).json({
      message: "Medicine updated successfully",
      medicine
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update medicine",
      error: error.message
    });
  }
};

// Delete medicine
const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found"
      });
    }

    res.status(200).json({
      message: "Medicine deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid medicine ID"
    });
  }
};

module.exports = {
  addMedicine,
  getMedicine,
  getAllMedicines,
  updateMedicine,
  deleteMedicine
};