import {
  createReviewService,
  getReviewsService,
  getReviewByIdService,
  getReviewsByStatusService,
  moderateReviewByIdService,
  updateReviewService,
} from '../services/review.service.js'
import { dtoReview } from '../utils/dtoReview.utils.js'
import { CustomError } from '../utils/customError.js'

export const createReview = async (req, res) => {
  try {
    // Tomar el userId del usuario autenticado (middleware)
    const userId = req.user._id || req.user.id
    const { productId, rating, comment } = req.body

    const newReview = await createReviewService({
      userId,
      productId,
      rating,
      comment,
    })

    res.status(201).json({
      status: 'success',
      message: 'Reseña creada exitosamente',
      data: dtoReview(newReview),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    const updatedReview = await updateReviewService(id, updateData)
    res.status(200).json({
      status: 'success',
      message: 'Reseña actualizada exitosamente',
      data: dtoReview(updatedReview),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const getReviews = async (req, res) => {
  try {
    const reviews = await getReviewsService()

    // Formatear las reseñas para la respuesta
    const formattedReviews = reviews.map(review => dtoReview(review))

    res.status(200).json({
      status: 'success',
      data: formattedReviews,
      total: reviews.length,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const getReviewById = async (req, res) => {
  try {
    const review = await getReviewByIdService(req.params.id)

    res.status(200).json({
      status: 'success',
      data: dtoReview(review),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const getReviewsByStatus = async (req, res) => {
  try {
    const queryParams = { ...req.params, ...req.query } // Combinar params y query
    const result = await getReviewsByStatusService(queryParams)

    res.status(200).json({
      status: 'success',
      data: result.reviews.map(review => dtoReview(review)),
      total: result.total,
      filterStatus: result.status,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params
    const moderationData = req.body // El service ahora valida todo

    const updated = await moderateReviewByIdService(id, moderationData)

    return res.status(200).json({
      status: 'success',
      message: `Reseña ${
        moderationData.decision === 'Aprobada' ? 'aprobada' : 'rechazada'
      } correctamente`,
      data: dtoReview(updated),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}
