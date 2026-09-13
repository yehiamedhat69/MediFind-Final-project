const mongoose = require('mongoose');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medifind';

async function seed() {
  await mongoose.connect(MONGO_URI);

  await Promise.all([
    User.deleteMany({}),
    Pharmacy.deleteMany({}),
    Medicine.deleteMany({}),
    Inventory.deleteMany({})
  ]);

  const customer = await User.create({
    name: 'Test Customer',
    email: 'customer@medifind.test',
    password: 'change-me',
    phone: '01000000000',
    role: 'customer'
  });

  const pharmacyUser = await User.create({
    name: 'Test Pharmacy Owner',
    email: 'pharmacy@medifind.test',
    password: 'change-me',
    phone: '01100000000',
    role: 'pharmacy'
  });

  const pharmacy = await Pharmacy.create({
    ownerId: pharmacyUser._id,
    name: 'MediFind Test Pharmacy',
    address: 'Zagazig, Sharqia, Egypt',
    phone: '01100000000',
    location: {
      type: 'Point',
      coordinates: [31.5021, 30.5877]
    }
  });

  const medicines = await Medicine.insertMany([
    {
      name: 'Paracetamol',
      genericName: 'Paracetamol',
      category: 'Pain Relief',
      description: 'Sample medicine record'
    },
    {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      description: 'Sample medicine record'
    },
    {
      name: 'Vitamin C',
      genericName: 'Ascorbic Acid',
      category: 'Vitamins',
      description: 'Sample medicine record'
    }
  ]);

  await Inventory.insertMany(
    medicines.map((medicine, index) => ({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      quantity: [50, 20, 35][index],
      price: [25, 80, 45][index],
      availability: true
    }))
  );

  console.log('Seed completed. Customer:', customer.email);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});