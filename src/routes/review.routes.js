import express from 'express'
import {
  createReview,
  getReviews,
  getReviewById,
  moderateReview,
  getReviewsByStatus,
} from '../controllers/review.controller.js'

const router = express.Router()

// Rutas públicas
router.post('/create', createReview)
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)

// Rutas administrativas
router.patch('/reviews/:id/moderate', moderateReview)
router.get('/admin/reviews/:status', getReviewsByStatus)

export default router
