const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'fulfilled', 'cancelled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

reservationSchema.index({ customerId: 1, createdAt: -1 });
reservationSchema.index({ pharmacyId: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
