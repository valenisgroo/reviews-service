import ProductRating from '../models/productRating.model.js'
import Review from '../models/review.model.js'
import { CustomError } from '../utils/customError.js'

export const getProductRatingService = async productId => {
  if (!productId || typeof productId !== 'string') {
    throw new CustomError('ID de producto inválido', 400)
  }

  const ratingInfo = await ProductRating.findOne({ productId })
  if (!ratingInfo) {
    return { productId, averageRating: 0, reviewCount: 0 }
  }

  return {
    productId: ratingInfo.productId,
    averageRating: ratingInfo.averageRating,
    reviewCount: ratingInfo.reviewCount,
  }
}

export const updateProductRatingService = async productId => {
  const reviews = await Review.find({
    productId,
    status: 'accepted',
    fecha_baja: null,
  })

  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10
        ) / 10
      : 0

  const updatedRating = await ProductRating.findOneAndUpdate(
    { productId },
    { averageRating, reviewCount },
    { upsert: true, new: true }
  )

  return { productId, averageRating, reviewCount }
}
