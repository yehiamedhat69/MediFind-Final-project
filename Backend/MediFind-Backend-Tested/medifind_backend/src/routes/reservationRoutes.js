const express = require("express");

const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
  createReservation,
  getMyReservations,
  getPharmacyReservations,
  updateReservationStatus,
  cancelReservation,
} = require("../controllers/reservationController");

// Customer
router.post(
  "/",
  authenticateToken,
  requireRole("customer"),
  createReservation
);

router.get(
  "/my",
  authenticateToken,
  requireRole("customer"),
  getMyReservations
);

router.patch(
  "/:id/cancel",
  authenticateToken,
  requireRole("customer"),
  cancelReservation
);

// Pharmacy
router.get(
  "/pharmacy/:pharmacyId",
  authenticateToken,
  requireRole("pharmacy"),
  getPharmacyReservations
);

router.patch(
  "/:id/status",
  authenticateToken,
  requireRole("pharmacy"),
  updateReservationStatus
);

module.exports = router;