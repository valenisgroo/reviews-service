import Review from '../models/review.model.js'
import { moderateContent } from '../utils/review.utils.js'

const createNewReview = async reviewData => {
  try {
    const { userId, productId, rating, comment } = reviewData

    // Verificar si el usuario ya ha dejado una reseña para este producto
    const existingReview = await Review.findOne({ userId, productId })
    if (existingReview) {
      const error = new Error(
        'El usuario ya ha dejado una reseña para este producto'
      )
      error.statusCode = 400
      throw error
    }

    // Moderar contenido
    const moderationResult = moderateContent(comment)

    // Crear la reseña con el resultado de la moderación
    const newReview = new Review({
      userId,
      productId,
      rating,
      comment,
      ...moderationResult,
    })

    const savedReview = await newReview.save()

    // Actualizar el rating promedio del producto
    await Review.calculateAverageRating(productId)

    return savedReview
  } catch (error) {
    // Propagar el error con el código de estado
    if (!error.statusCode) {
      error.statusCode = 500
    }
    throw error
  }
}

const getReviews = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId = null,
      userId = null,
      sortBy = 'createdAt',
      order = 'desc',
    } = options

    const skip = (page - 1) * limit

    // Construir el filtro basado en parámetros opcionales
    const filter = {}
    if (productId) filter.productId = productId
    if (userId) filter.userId = userId

    // Solo mostrar reseñas aprobadas por defecto
    filter.isApproved = true

    // Configurar el orden
    const sort = { [sortBy]: order === 'asc' ? 1 : -1 }

    const [reviews, total] = await Promise.all([
      Review.find(filter).sort(sort).skip(skip).limit(limit),
      Review.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      reviews,
      metadata: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    }
  } catch (error) {
    error.statusCode = 500
    throw error
  }
}

const getReviewById = async id => {
  try {
    const review = await Review.findById(id)

    if (!review) {
      const error = new Error('Reseña no encontrada')
      error.statusCode = 404
      throw error
    }

    return review
  } catch (error) {
    // Si es un error de CastError de Mongoose, cambiar el mensaje
    if (error.name === 'CastError') {
      const customError = new Error('ID de reseña inválido')
      customError.statusCode = 400
      throw customError
    }

    // Propagar el error con el código de estado
    if (!error.statusCode) {
      error.statusCode = 500
    }
    throw error
  }
}

export default {
  createNewReview,
  getReviews,
  getReviewById,
}
