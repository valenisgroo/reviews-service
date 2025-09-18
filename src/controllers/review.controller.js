import reviewService from '../services/review.service.js'
import { moderateReviewById } from '../services/review.service.js'
import { formatReview } from '../utils/review.utils.js'

export const createReview = async (req, res) => {
  try {
    // Los datos ya han sido validados por el middleware
    const reviewData = req.validatedData || req.body

    const newReview = await reviewService.createNewReview(reviewData)

    res.status(201).json({
      status: 'success',
      message: 'Reseña creada exitosamente',
      data: formatReview(newReview),
    })
  } catch (error) {
    console.error('Error al crear la reseña:', error)

    // Manejar errores específicos
    const statusCode = error.statusCode || 500
    const errorMessage =
      statusCode === 500
        ? 'Error interno del servidor al crear la reseña'
        : error.message

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
    })
  }
}

export const getReviews = async (req, res) => {
  try {
    // Usar los parámetros ya validados por el middleware
    const options = req.validatedQuery || req.query

    const result = await reviewService.getReviews(options)

    // Formatear las reseñas para la respuesta
    const formattedReviews = result.reviews.map(review => formatReview(review))

    res.status(200).json({
      status: 'success',
      data: formattedReviews,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Error al obtener las reseñas:', error)

    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
      status: 'error',
      message: 'Error al obtener las reseñas',
    })
  }
}

export const getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id)

    res.status(200).json({
      status: 'success',
      data: formatReview(review),
    })
  } catch (error) {
    console.error('Error al obtener la reseña:', error)

    const statusCode = error.statusCode || 500
    const errorMessage =
      statusCode === 500
        ? 'Error interno del servidor al obtener la reseña'
        : error.message

    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
    })
  }
}

export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { decision, reason } = req.validatedData || req.body

    if (!decision || !['Aprobada', 'Rechazada'].includes(decision)) {
      return res.status(400).json({
        status: 'error',
        message: 'La decisión debe ser "Aprobada" o "Rechazada"',
      })
    }

    const updated = await moderateReviewById(id, decision, reason)

    return res.status(200).json({
      status: 'success',
      message: `Reseña ${
        decision === 'Aprobada' ? 'Aprobada' : 'Rechazada'
      } correctamente`,
      data: formatReview(updated),
    })
  } catch (error) {
    console.error('Error al moderar la reseña:', error)
    const statusCode = error.statusCode || 500
    const errorMessage =
      statusCode === 500
        ? 'Error interno del servidor al moderar la reseña'
        : error.message
    return res
      .status(statusCode)
      .json({ status: 'error', message: errorMessage })
  }
}
