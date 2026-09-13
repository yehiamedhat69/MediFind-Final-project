const express = require("express");

const {
  addMedicine,
  getMedicine,
  getAllMedicines,
  updateMedicine,
  deleteMedicine
} = require("../controllers/medicineController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, addMedicine);

router.get("/:id", authMiddleware, getMedicine);

router.get("/", authMiddleware, getAllMedicines);

router.patch("/:id", authMiddleware, updateMedicine);

router.delete("/:id", authMiddleware, deleteMedicine);

module.exports = router;