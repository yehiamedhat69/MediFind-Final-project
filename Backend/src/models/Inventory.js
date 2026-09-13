const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    availability: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// One medicine should have only one inventory record per pharmacy.
inventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });
inventorySchema.index({ medicineId: 1, availability: 1 });
inventorySchema.index({ pharmacyId: 1 });
module.exports = mongoose.model('Inventory', inventorySchema);
