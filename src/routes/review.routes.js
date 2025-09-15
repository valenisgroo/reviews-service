import express from 'express'
import {
  createReview,
  getReviews,
  getReviewById,
} from '../controllers/review.controller.js'

const router = express.Router()

router.post('/create', createReview)
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)

export default router
