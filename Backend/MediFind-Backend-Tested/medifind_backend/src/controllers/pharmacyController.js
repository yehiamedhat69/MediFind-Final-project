const Pharmacy = require("../models/Pharmacy");

// Add pharmacy
const addPharmacy = async (req, res) => {
  try {
const { name, address, phone, location } = req.body;
    const existing = await Pharmacy.findOne({ ownerId: req.user.id });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This account already owns a pharmacy"
      });
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
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to add pharmacy",
      error: error.message
    });
  }
};

// Get one pharmacy
const getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found"
      });
    }

    res.status(200).json({ success: true, pharmacy });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid pharmacy ID" });
  }
};

// Get all pharmacies
const getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.status(200).json({ success: true, data: pharmacies });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve pharmacies" });
  }
};

// Update pharmacy (owner only)
const updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    if (pharmacy.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this pharmacy"
      });
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
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update pharmacy", error: error.message });
  }
};

// Delete pharmacy (owner only)
const deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    if (pharmacy.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this pharmacy"
      });
    }

    await Pharmacy.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Pharmacy deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid pharmacy ID" });
  }
};

module.exports = {
  addPharmacy,
  getPharmacy,
  getAllPharmacies,
  updatePharmacy,
  deletePharmacy
};