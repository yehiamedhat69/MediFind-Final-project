const Inventory = require("../models/Inventory");
const Pharmacy = require("../models/Pharmacy");
const Medicine = require("../models/medicine");

// Get pharmacy owned by the logged-in user
const getUserPharmacy = async (userId) => {
  return await Pharmacy.findOne({ ownerId: userId });
};


// Add medicine to pharmacy inventory
const addMedicineToInventory = async (req, res) => {
  try {
    // Only pharmacy users can manage inventory
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Only pharmacy users can manage inventory",
      });
    }

    const { medicineId, quantity, price, availability } = req.body;

    // Validation
    if (!medicineId || quantity === undefined || price === undefined) {
      return res.status(400).json({
        message: "medicineId, quantity and price are required",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    // Find pharmacy owned by logged-in user
    const pharmacy = await getUserPharmacy(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Pharmacy not found",
      });
    }

    // Check medicine exists
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    // Prevent duplicate inventory record
    const existingInventory = await Inventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId,
    });

    if (existingInventory) {
      return res.status(409).json({
        message: "Medicine already exists in this pharmacy inventory",
      });
    }

    // Create inventory record
    const inventory = await Inventory.create({
      pharmacyId: pharmacy._id,
      medicineId,
      quantity,
      price,
      availability:
        availability === undefined ? true : availability,
    });

    res.status(201).json({
      message: "Medicine added to inventory successfully",
      inventory,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get pharmacy inventory
const getPharmacyInventory = async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Only pharmacy users can access inventory",
      });
    }

    const { pharmacyId } = req.params;

    // Get user's pharmacy
    const pharmacy = await getUserPharmacy(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Pharmacy not found",
      });
    }

    // Prevent accessing another pharmacy's inventory
    if (pharmacy._id.toString() !== pharmacyId) {
      return res.status(403).json({
        message: "You are not authorized to access this pharmacy inventory",
      });
    }

    const inventory = await Inventory.find({
      pharmacyId: pharmacy._id,
    }).populate("medicineId");

    res.status(200).json({
      message: "Pharmacy inventory retrieved successfully",
      inventory,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get specific medicine from pharmacy inventory
const getMedicineInventory = async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Only pharmacy users can access inventory",
      });
    }

    const { pharmacyId, medicineId } = req.params;

    const pharmacy = await getUserPharmacy(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Pharmacy not found",
      });
    }

    // Prevent accessing another pharmacy's inventory
    if (pharmacy._id.toString() !== pharmacyId) {
      return res.status(403).json({
        message: "You are not authorized to access this pharmacy inventory",
      });
    }

    const inventory = await Inventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId,
    }).populate("medicineId");

    if (!inventory) {
      return res.status(404).json({
        message: "Medicine not found in pharmacy inventory",
      });
    }

    res.status(200).json({
      message: "Inventory information retrieved successfully",
      inventory,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Update inventory
const updateInventory = async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Only pharmacy users can modify inventory",
      });
    }

    const { inventoryId } = req.params;
    const { quantity, price, availability } = req.body;

    // Validate that at least one field exists
    if (
      quantity === undefined &&
      price === undefined &&
      availability === undefined
    ) {
      return res.status(400).json({
        message: "At least one field must be provided",
      });
    }

    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({
        message: "Quantity cannot be negative",
      });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const pharmacy = await getUserPharmacy(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Pharmacy not found",
      });
    }

    // IMPORTANT:
    // Search by inventory ID AND pharmacy ID
    // so one pharmacy cannot modify another pharmacy's inventory.
    const inventory = await Inventory.findOne({
      _id: inventoryId,
      pharmacyId: pharmacy._id,
    });

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    if (quantity !== undefined) {
      inventory.quantity = quantity;
    }

    if (price !== undefined) {
      inventory.price = price;
    }

    if (availability !== undefined) {
      inventory.availability = availability;
    }

    await inventory.save();

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Remove medicine from inventory
const removeMedicineFromInventory = async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") {
      return res.status(403).json({
        message: "Only pharmacy users can modify inventory",
      });
    }

    const { inventoryId } = req.params;

    const pharmacy = await getUserPharmacy(req.user.id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Pharmacy not found",
      });
    }

    const inventory = await Inventory.findOneAndDelete({
      _id: inventoryId,
      pharmacyId: pharmacy._id,
    });

    if (!inventory) {
      return res.status(404).json({
        message: "Inventory item not found",
      });
    }

    res.status(200).json({
      message: "Medicine removed from inventory successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// Get all inventory records
const getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("pharmacyId")
      .populate("medicineId");

    res.status(200).json({
      message: "All inventory retrieved successfully",
      inventory,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


module.exports = {
  addMedicineToInventory,
  getPharmacyInventory,
  getMedicineInventory,
  updateInventory,
  removeMedicineFromInventory,
  getAllInventory,
};

