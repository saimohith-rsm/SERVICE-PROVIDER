const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: [true, 'Service must belong to a provider'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Service must belong to a category'],
    },
    title: {
      type: String,
      required: [true, 'Please provide service title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide service description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide service price'],
      min: [0, 'Price must be greater than or equal to 0'],
    },
    estimatedDuration: {
      type: String,
      default: '1-2 hours',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ title: 'text', description: 'text' });
serviceSchema.index({ categoryId: 1, price: 1 });

module.exports = mongoose.model('Service', serviceSchema);

