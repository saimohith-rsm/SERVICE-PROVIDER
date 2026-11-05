const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have a customer author'],
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Review must be assigned to a provider'],
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be associated with a completed booking'],
      unique: true, // One review per completed booking
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Minimum rating is 1'],
      max: [5, 'Maximum rating is 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide review comment'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Static method to recalculate provider rating & total reviews
reviewSchema.statics.calculateAverageRating = async function (providerId) {
  const stats = await this.aggregate([
    { $match: { providerId: new mongoose.Types.ObjectId(providerId) } },
    {
      $group: {
        _id: '$providerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Provider = mongoose.model('Provider');
  if (stats.length > 0) {
    await Provider.findByIdAndUpdate(providerId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Provider.findByIdAndUpdate(providerId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.providerId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.providerId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);

