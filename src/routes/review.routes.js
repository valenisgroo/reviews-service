import { Router } from 'express'
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
  getProductRating,
  verifyReviewOrder,
} from '../controllers/review.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { isAdmin } from '../middlewares/admin.middleware.js'

const router = Router()

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Crear una nueva reseña
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReview'
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post('/create', authMiddleware, createReview)

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Obtener todas las reseñas
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de producto
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de usuario
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get('/reviews', getReviews)

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Obtener una reseña por ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *       404:
 *         description: Reseña no encontrada
 */
router.get('/reviews/:id', getReviewById)

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Obtener todas las reseñas de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: accepted
 *     responses:
 *       200:
 *         description: Reseñas del producto
 */
router.get('/reviews/product/:productId', getAllReviewsProduct)

/**
 * @swagger
 * /reviews/average/{productId}:
 *   get:
 *     summary: Obtener calificación promedio de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Calificación promedio
 */
router.get('/reviews/average/:productId', getAverageRating)

/**
 * @swagger
 * /reviews/update/{id}:
 *   patch:
 *     summary: Actualizar una reseña
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReview'
 *     responses:
 *       200:
 *         description: Reseña actualizada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 */
router.patch('/reviews/update/:id', authMiddleware, updateReview)

/**
 * @swagger
 * /reviews/delete/{id}:
 *   delete:
 *     summary: Eliminar una reseña
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Reseña eliminada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 */
router.delete('/reviews/delete/:id', authMiddleware, deletedReviewById)

/**
 * @swagger
 * /products/{productId}/rating:
 *   get:
 *     summary: Obtener información de rating de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Información de rating
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductRating'
 */
router.get('/products/:productId/rating', getProductRating)

/**
 * @swagger
 * /reviews/{id}/moderate:
 *   patch:
 *     summary: Moderar una reseña (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModerateReview'
 *     responses:
 *       200:
 *         description: Reseña moderada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 *       404:
 *         description: Reseña no encontrada
 */
router.patch('/reviews/:id/moderate', authMiddleware, isAdmin, moderateReview)

/**
 * @swagger
 * /admin/reviews/{status}:
 *   get:
 *     summary: Obtener reseñas por estado (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, moderated, accepted, rejected]
 *         description: Estado de las reseñas
 *     responses:
 *       200:
 *         description: Reseñas por estado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol admin)
 */
router.get(
  '/admin/reviews/:status',
  authMiddleware,
  isAdmin,
  getReviewsByStatus
)

/**
 * @swagger
 * /reviews/{id}/verify-order:
 *   post:
 *     summary: Verificar manualmente si existe orden para una reseña (Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña
 *     responses:
 *       200:
 *         description: Verificación completada
 *       400:
 *         description: Estado de reseña inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 */
router.post(
  '/reviews/:id/verify-order',
  authMiddleware,
  isAdmin,
  verifyReviewOrder
)

export default router
