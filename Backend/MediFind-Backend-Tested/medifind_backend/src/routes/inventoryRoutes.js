const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
const {
  addMedicineToInventory,
  getPharmacyInventory,
  getMedicineInventory,
  updateInventory,
  removeMedicineFromInventory,
  getAllInventory,
} = require("../controllers/inventoryController");

router.use(authenticateToken);
router.get("/all", getAllInventory);
router.get("/pharmacy/:pharmacyId", getPharmacyInventory);
router.get("/pharmacy/:pharmacyId/medicine/:medicineId", getMedicineInventory);
router.post("/", addMedicineToInventory);
router.put("/:inventoryId", updateInventory);
router.delete("/:inventoryId", removeMedicineFromInventory);
module.exports = router;