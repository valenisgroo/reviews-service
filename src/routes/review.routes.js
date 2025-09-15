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
} from '../validators/review.validator.js'

const router = express.Router()

router.post('/create', validateSchema(createReviewSchema), createReview)

router.get('/reviews', validateQuerySchema(listReviewsQuerySchema), getReviews)

router.get('/reviews/:id', getReviewById)

export default router
