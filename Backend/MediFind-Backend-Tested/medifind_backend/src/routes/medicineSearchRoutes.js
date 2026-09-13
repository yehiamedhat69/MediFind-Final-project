// src/routes/medicineSearchRoutes.js
const express = require("express");
const {
  searchMedicineAvailability,
  searchNearbyPharmacies,
  getMedicineAvailabilityInPharmacy,
  getPharmacyMedicines
} = require("../controllers/medicineSearchController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Search for medicine availability across pharmacies (public)
router.get("/medicine", searchMedicineAvailability);

// Get medicine availability in a specific pharmacy
router.get(
  "/medicine/:medicineId/pharmacy/:pharmacyId",
  authMiddleware,
  getMedicineAvailabilityInPharmacy
);

// Get all medicines available in a specific pharmacy
router.get(
  "/pharmacy/:pharmacyId/medicines",
  authMiddleware,
  getPharmacyMedicines
);

// Search for nearby pharmacies
router.get("/nearby", authMiddleware, searchNearbyPharmacies);

module.exports = router;