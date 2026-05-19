const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'cleaning',
        'plumbing',
        'electrical',
        'tutoring',
        'design',
        'delivery',
        'other',
      ],
    },
    price: {
      type: Number,
      requored: [true, 'price is required'],
      min: 0,
    },
    location: {
      type: String,
      required:[true, 'Location is required']
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);