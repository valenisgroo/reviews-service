import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },

    status: {
      type: String,
      enum: ['pending', 'moderated', 'accepted', 'rejected'],
      default: 'pending',
    },

    statusReason: {
      type: String,
      default: null,
    },
    fecha_baja: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// Índice único para evitar reviews duplicadas del mismo usuario al mismo producto
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)

export default Review
