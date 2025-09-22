import express from 'express'
import {
  createReview,
  getReviews,
  getReviewById,
  moderateReview,
  getReviewsByStatus,
} from '../controllers/review.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = express.Router()

// Rutas públicas
router.post('/create', authMiddleware, createReview)
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)

// Rutas administrativas
router.patch('/reviews/:id/moderate', authMiddleware, isAdmin, moderateReview)
router.get(
  '/admin/reviews/:status',
  authMiddleware,
  isAdmin,
  getReviewsByStatus
)

export default router
