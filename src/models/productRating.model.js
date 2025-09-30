import mongoose from 'mongoose'

const productRatingSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
})

export default mongoose.model('ProductRating', productRatingSchema)
