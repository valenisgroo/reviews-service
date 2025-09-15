import Review from '../models/review.model.js'
import { createReviewSchema } from '../validators/review.validator.js'

const createNewReview = async reviewData => {
  console.log('Creando nueva reseña:', reviewData)
}

const listReview = async () => {
  return await Review.find().sort({ createdAt: -1 })
}

const listOneReview = async id => {
  return await Review.findById(id)
}

export default {
  createNewReview,
  listReview,
  listOneReview,
}
