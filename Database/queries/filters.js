const Medicine = require('../models/Medicine');

async function filterMedicines({ category, name }) {
  const filter = { isActive: true };

  if (category) filter.category = category;
  if (name) filter.name = { $regex: name, $options: 'i' };

  return Medicine.find(filter).sort({ name: 1 });
}

module.exports = { filterMedicines };
