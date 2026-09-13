const express = require("express");

const {
  addPharmacy,
  getPharmacy,
  getAllPharmacies,
  updatePharmacy,
  deletePharmacy
} = require("../controllers/pharmacyController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, requireRole("pharmacy"), addPharmacy);
router.get("/:id", authMiddleware, getPharmacy);
router.get("/", authMiddleware, getAllPharmacies);
router.patch("/:id", authMiddleware, requireRole("pharmacy"), updatePharmacy);
router.delete("/:id", authMiddleware, requireRole("pharmacy"), deletePharmacy);

module.exports = router;