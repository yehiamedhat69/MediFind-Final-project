const Reservation = require("../models/Reservation");
const Inventory = require("../models/Inventory");
const Medicine = require("../models/medicine");
const Pharmacy = require("../models/Pharmacy");
const Notification = require("../models/Notification");

// CREATE RESERVATION
const createReservation = async (req, res) => {
  try {
    const { pharmacyId, medicineId, quantity } = req.body;
    const customerId = req.user.id || req.user._id;

    if (!pharmacyId || !medicineId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "pharmacyId, medicineId and quantity are required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!pharmacy || !pharmacy.isActive) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found or inactive",
      });
    }

    const inventory = await Inventory.findOne({
      pharmacyId,
      medicineId,
    });

    if (!inventory || !inventory.availability) {
      return res.status(400).json({
        success: false,
        message: "Medicine is currently unavailable",
      });
    }

    if (inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${inventory.quantity} units are available`,
      });
    }

    inventory.quantity -= quantity;

    if (inventory.quantity === 0) {
      inventory.availability = false;
    }

    await inventory.save();

    const reservation = await Reservation.create({
      customerId,
      pharmacyId,
      medicineId,
      quantity,
      unitPrice: inventory.price,
      status: "pending",
    });

    await Notification.create({
      userId: customerId,
      reservationId: reservation._id,
      medicineId,
      type: "reservation_created",
      message: "Your reservation has been created successfully.",
    });

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create reservation",
      error: error.message,
    });
  }
};

// GET MY RESERVATIONS
const getMyReservations = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;

    const reservations = await Reservation.find({ customerId })
      .populate("medicineId")
      .populate("pharmacyId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reservations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get reservations",
      error: error.message,
    });
  }
};

// GET PHARMACY RESERVATIONS
const getPharmacyReservations = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      _id: req.params.pharmacyId,
      ownerId: req.user.id || req.user._id,
    });

    if (!pharmacy) {
      return res.status(403).json({
        success: false,
        message: "You do not own this pharmacy",
      });
    }

    const reservations = await Reservation.find({
      pharmacyId: pharmacy._id,
    })
      .populate("customerId", "-password")
      .populate("medicineId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reservations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get pharmacy reservations",
      error: error.message,
    });
  }
};

// UPDATE RESERVATION STATUS
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pharmacyId = req.user.id || req.user._id;

    const allowedStatuses = [
      "accepted",
      "rejected",
      "fulfilled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status",
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const pharmacy = await Pharmacy.findOne({
      _id: reservation.pharmacyId,
      ownerId: pharmacyId,
    });

    if (!pharmacy) {
      return res.status(403).json({
        success: false,
        message: "You do not own this pharmacy",
      });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reservations can be updated",
      });
    }

    reservation.status = status;

    // If rejected, return quantity to inventory
    if (status === "rejected") {
      const inventory = await Inventory.findOne({
        pharmacyId: reservation.pharmacyId,
        medicineId: reservation.medicineId,
      });

      if (inventory) {
        inventory.quantity += reservation.quantity;
        inventory.availability = true;

        await inventory.save();

        // Medicine availability notification
        await Notification.create({
          userId: reservation.customerId,
          reservationId: reservation._id,
          medicineId: reservation.medicineId,
          type: "medicine_available",
          message: "The medicine is available again.",
        });
      }
    }

    await reservation.save();

    const notificationMessages = {
      accepted: "Your reservation has been accepted.",
      rejected: "Your reservation has been rejected.",
      fulfilled: "Your reservation has been fulfilled.",
    };

    await Notification.create({
      userId: reservation.customerId,
      reservationId: reservation._id,
      medicineId: reservation.medicineId,
      type: `reservation_${status}`,
      message: notificationMessages[status],
    });

    return res.status(200).json({
      success: true,
      message: "Reservation status updated successfully",
      reservation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update reservation status",
      error: error.message,
    });
  }
};

// CANCEL RESERVATION
const cancelReservation = async (req, res) => {
  try {
    const customerId = req.user.id || req.user._id;

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      customerId,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (reservation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reservations can be cancelled",
      });
    }

    reservation.status = "cancelled";

    const inventory = await Inventory.findOne({
      pharmacyId: reservation.pharmacyId,
      medicineId: reservation.medicineId,
    });

    if (inventory) {
      inventory.quantity += reservation.quantity;
      inventory.availability = true;

      await inventory.save();
    }

    await reservation.save();

    await Notification.create({
      userId: customerId,
      reservationId: reservation._id,
      medicineId: reservation.medicineId,
      type: "reservation_cancelled",
      message: "Your reservation has been cancelled successfully.",
    });

    return res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel reservation",
      error: error.message,
    });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getPharmacyReservations,
  updateReservationStatus,
  cancelReservation,
};