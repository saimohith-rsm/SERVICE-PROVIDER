const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must have a customer'],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Booking must be assigned to a provider'],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Booking must reference a service'],
    },
    bookingDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Please select a booking date'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Please select a time slot'],
    },
    serviceAddress: {
      street: { type: String, required: true },
      city: { type: String, default: 'Guntur' },
      state: { type: String, default: 'Andhra Pradesh' },
      postalCode: { type: String, default: '' },
      landmark: { type: String, default: '' },
    },
    customerPhone: {
      type: String,
      required: [true, 'Contact phone number is required'],
    },
    problemDescription: {
      type: String,
      default: '',
    },
    estimatedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    bookingStatus: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'On The Way',
        'In Progress',
        'Completed',
        'Rejected',
        'Cancelled',
      ],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Online'],
      default: 'Cash',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent double booking for active slots: same provider, date, and slot cannot have multiple active bookings
bookingSchema.index(
  { providerId: 1, bookingDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      bookingStatus: {
        $in: ['Pending', 'Accepted', 'On The Way', 'In Progress', 'Completed'],
      },
    },
  }
);

bookingSchema.index({ customerId: 1, createdAt: -1 });
bookingSchema.index({ providerId: 1, createdAt: -1 });
bookingSchema.index({ bookingStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

