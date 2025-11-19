import mongoose from 'mongoose'

const productRatingSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalRating: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const ProductRating = mongoose.model('ProductRating', productRatingSchema)

export default ProductRating
