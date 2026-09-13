const Medicine = require('../models/Medicine');

async function searchMedicines(searchTerm) {
  if (!searchTerm || !searchTerm.trim()) return [];

  return Medicine.find({
    $text: { $search: searchTerm.trim() },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
}

module.exports = { searchMedicines };
