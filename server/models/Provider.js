const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Please provide business name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    experience: {
      type: Number,
      default: 1,
      min: [0, 'Experience cannot be negative'],
    },
    serviceAreas: {
      type: [String],
      default: ['Guntur', 'Brodipet', 'Arundelpet'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    availability: {
      days: {
        type: [String],
        default: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
      },
      timeSlots: {
        type: [String],
        default: [
          '09:00 AM - 11:00 AM',
          '11:00 AM - 01:00 PM',
          '02:00 PM - 04:00 PM',
          '04:00 PM - 06:00 PM',
        ],
      },
      isAcceptingBookings: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for search performance
providerSchema.index({ businessName: 'text', serviceAreas: 'text' });

module.exports = mongoose.model('Provider', providerSchema);

