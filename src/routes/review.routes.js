import express from 'express'
import {
  createReview,
  getReviews,
  getReviewById,
  moderateReview,
  getReviewsByStatus,
  updateReview,
  deletedReviewById,
  getAllReviewsProduct,
  getAverageRating,
} from '../controllers/review.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = express.Router()

// Rutas públicas
router.post('/create', authMiddleware, createReview)
router.get('/reviews', getReviews)
router.get('/reviews/:id', getReviewById)
router.get('/reviews/product/:productId', getAllReviewsProduct)
router.get('/reviews/average/:productId', getAverageRating)
router.patch('/reviews/update/:id', authMiddleware, updateReview)
router.delete('/reviews/delete/:id', authMiddleware, deletedReviewById)

// Rutas administrativas
router.patch('/reviews/:id/moderate', authMiddleware, isAdmin, moderateReview)
router.get(
  '/admin/reviews/:status',
  authMiddleware,
  isAdmin,
  getReviewsByStatus
)

export default router
