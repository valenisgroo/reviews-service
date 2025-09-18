import Review from '../models/review.model.js'
import moderateReviewContent from '../utils/moderation.utils.js'

const createNewReview = async reviewData => {
  try {
    const { userId, productId, rating, comment } = reviewData

    // Verificar si el usuario ya ha dejado una reseña para este producto
    const existingReview = await Review.findOne({ userId, productId })
    if (existingReview) {
      throw new Error('El usuario ya ha dejado una reseña para este producto')
    }

    // Crear la reseña en estado pending (sin moderar automáticamente)
    const newReview = new Review({
      userId,
      productId,
      rating,
      comment,
      status: 'pending', 
      statusReason: 'Esperando moderación',
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

    // Solo mostrar reseñas aceptadas por defecto
    filter.status = 'accepted'

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

// Función para moderación manual
export const moderateReviewById = async (id, decision, reason) => {
  try {
    const review = await Review.findById(id)
    if (!review) {
      const err = new Error('Reseña no encontrada')
      err.statusCode = 404
      throw err
    }

    let newStatus, newReason

    if (decision === 'Aprobada') {
      newStatus = 'moderated'
      newReason =
        reason || 'Aprobada manualmente - pendiente verificación de orden'
    } else {
      newStatus = 'rejected'
      newReason = reason || 'Rechazada manualmente'
    }

    const updated = await Review.findByIdAndUpdate(
      id,
      { status: newStatus, statusReason: newReason },
      { new: true }
    )
    return updated
  } catch (error) {
    if (error.name === 'CastError') {
      const e = new Error('ID de reseña inválido')
      e.statusCode = 400
      throw e
    }
    if (!error.statusCode) error.statusCode = 500
    throw error
  }
}

// Función para moderación automática con Cron
export const moderateAllReviewsBatch = async () => {
  try {
    console.log('Iniciando moderación automática diaria')

    // Buscar todas las reviews en estado 'pending' (esperando moderación)
    const reviewsToCheck = await Review.find({ status: 'pending' })

    console.log(`Encontradas ${reviewsToCheck.length} reseñas para revisar`)

    let rejectedCount = 0
    let moderatedCount = 0

    for (const review of reviewsToCheck) {
      const moderationResult = moderateReviewContent(review.comment)

      if (!moderationResult.isApproved) {
        // Rechazar por contenido inapropiado
        await Review.findByIdAndUpdate(review._id, {
          status: 'rejected',
          statusReason: moderationResult.moderationReason,
        })
        rejectedCount++
        console.log(
          `Review ${review._id} rechazada: ${moderationResult.moderationReason}`
        )
      } else {
        // Marcar como moderada (pendiente verificación de orden)
        await Review.findByIdAndUpdate(review._id, {
          status: 'moderated',
          statusReason: 'Revisada automáticamente y aprobada',
        })
        moderatedCount++
        console.log(`Review ${review._id} marcada como moderada`)
      }
    }

    console.log(
      `Moderación completada. ${rejectedCount} rechazadas, ${moderatedCount} marcadas como moderadas`
    )

    return {
      totalChecked: reviewsToCheck.length,
      totalModerated: rejectedCount,
      totalApproved: moderatedCount,
    }
  } catch (error) {
    console.error('Error en moderación automática:', error)
    throw error
  }
}
