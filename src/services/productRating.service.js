import ProductRating from '../models/productRating.model.js'
import Review from '../models/review.model.js'
import { CustomError } from '../utils/customError.js'

export const getProductRatingService = async productId => {
  if (!productId || typeof productId !== 'string') {
    throw new CustomError('ID de producto inválido', 400)
  }

  const ratingInfo = await ProductRating.findOne({ productId })

  if (!ratingInfo) {
    return {
      productId,
      totalRating: 0,
      reviewCount: 0,
      averageRating: 0,
    }
  }

  return {
    productId: ratingInfo.productId,
    totalRating: ratingInfo.totalRating,
    reviewCount: ratingInfo.reviewCount,
    averageRating: ratingInfo.averageRating,
  }
}

export const updateProductRatingService = async productId => {
  const reviews = await Review.find({
    productId,
    status: 'accepted',
    fecha_baja: null,
  })

  const reviewCount = reviews.length

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)

  const averageRating =
    reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0

  const updatedRating = await ProductRating.findOneAndUpdate(
    { productId },
    {
      totalRating,
      reviewCount,
      averageRating,
    },
    { upsert: true, new: true }
  )

  return {
    productId,
    totalRating,
    reviewCount,
    averageRating,
  }
}
