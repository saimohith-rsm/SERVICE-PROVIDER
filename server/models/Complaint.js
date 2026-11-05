const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide complaint subject'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide complaint details'],
    },
    status: {
      type: String,
      enum: ['Open', 'Under Review', 'Resolved', 'Dismissed'],
      default: 'Open',
    },
    adminResponse: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ customerId: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);

