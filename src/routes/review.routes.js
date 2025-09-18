import express from 'express'
import {
  createReview,
  getReviews,
  getReviewById,
} from '../controllers/review.controller.js'
import {
  validateSchema,
  validateQuerySchema,
  createReviewSchema,
  listReviewsQuerySchema,
  moderateReviewSchema,
} from '../validators/review.validator.js'
// Moderación manual de una reseña
import { moderateReview } from '../controllers/review.controller.js'

const router = express.Router()

router.post('/create', validateSchema(createReviewSchema), createReview)

router.get('/reviews', validateQuerySchema(listReviewsQuerySchema), getReviews)

router.get('/reviews/:id', getReviewById)

router.patch(
  '/reviews/:id/moderate',
  validateSchema(moderateReviewSchema),
  moderateReview
)

export default router
