const Inventory = require('../models/Inventory');

async function findAvailableMedicine(medicineId) {
  return Inventory.find({
    medicineId,
    availability: true,
    quantity: { $gt: 0 }
  })
    .populate('pharmacyId', 'name address phone location')
    .populate('medicineId', 'name genericName category')
    .sort({ price: 1 });
}

module.exports = { findAvailableMedicine };
