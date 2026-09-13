const express = require("express");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllPharmaciesAdmin,
  updatePharmacyAdmin,
  deletePharmacyAdmin,
  getAllReservationsAdmin,
  deleteReservationAdmin
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, requireRole("admin"));

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Pharmacies
router.get("/pharmacies", getAllPharmaciesAdmin);
router.patch("/pharmacies/:id", updatePharmacyAdmin);
router.delete("/pharmacies/:id", deletePharmacyAdmin);

// Reservations
router.get("/reservations", getAllReservationsAdmin);
router.delete("/reservations/:id", deleteReservationAdmin);

module.exports = router;