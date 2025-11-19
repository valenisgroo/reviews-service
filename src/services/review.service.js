import Review from '../models/review.model.js'
import moderateReviewContent from '../utils/moderation.utils.js'
import {
  validateCreateReview,
  validateModerateReview,
  validateGetReviewsByStatus,
  validateUpdateReview,
} from '../validators/review.validator.js'
import { CustomError } from '../utils/customError.js'
import { updateProductRatingService } from './productRating.service.js'

export const createReviewService = async reviewData => {
  const validateData = validateCreateReview(reviewData)
  if (!validateData.success) {
    throw new CustomError('Datos de reseña inválidos', 400)
  }

  const { userId, productId, rating, comment } = reviewData

  // Verificar si el usuario ya ha dejado una reseña para este producto
  const existingReview = await Review.findOne({
    userId,
    productId,
    fecha_baja: null,
  })
  if (existingReview) {
    throw new CustomError(
      'El usuario ya ha dejado una reseña para este producto',
      400
    )
  }

  const newReview = new Review({
    userId,
    productId,
    rating,
    comment,
    status: 'pending',
    statusReason: 'Esperando moderación',
  })

  if (!newReview) {
    throw new CustomError('Error al crear la reseña', 500)
  }

  const savedReview = await newReview.save()
  if (!savedReview) {
    throw new CustomError('Error al guardar la reseña en la base de datos', 500)
  }
  return savedReview
}

export const updateReviewService = async (id, updateData) => {
  if (!id || typeof id !== 'string') {
    throw new CustomError('ID de reseña inválido', 400)
  }

  const validationResult = validateUpdateReview(updateData)
  if (!validationResult.success) {
    throw new CustomError('Datos de actualización inválidos', 400)
  }

  const { rating, comment } = validationResult.data

  const existingReview = await Review.findOne({ _id: id, fecha_baja: null })
  if (!existingReview) {
    throw new CustomError('Reseña no encontrada o ya fue eliminada', 404)
  }

  const updatedReview = await Review.findByIdAndUpdate(
    id,
    { rating, comment },
    { new: true }
  )

  if (!updatedReview) {
    throw new CustomError('Error al actualizar la reseña', 500)
  }

  return updatedReview
}

export const getReviewsService = async () => {
  const reviews = await Review.find({ fecha_baja: null }).sort({
    createdAt: -1,
  })

  if (!reviews || !Array.isArray(reviews)) {
    throw new CustomError(
      'Error al obtener las reseñas de la base de datos',
      500
    )
  }

  return reviews
}

export const getReviewByIdService = async id => {
  if (!id || typeof id !== 'string') {
    throw new CustomError('ID de reseña inválido', 400)
  }

  const review = await Review.findById(id)

  if (!review) {
    throw new CustomError('Reseña no encontrada', 404)
  }

  if (review.fecha_baja !== null) {
    throw new CustomError('Reseña no encontrada', 404)
  }

  return review
}

export const deleteReviewByIdService = async id => {
  if (!id || typeof id !== 'string') {
    throw new CustomError('ID de reseña inválido', 400)
  }

  const verfiedDelete = await Review.findOne({ _id: id, fecha_baja: null })
  if (!verfiedDelete) {
    throw new CustomError('Reseña no encontrada o ya fue eliminada', 404)
  }

  const deletedReview = await Review.findByIdAndUpdate(
    id,
    { fecha_baja: new Date() },
    { new: true }
  )

  if (!deletedReview) {
    throw new CustomError('Error al eliminar la reseña', 500)
  }

  // Si la reseña eliminada estaba aceptada, actualizar el rating del producto
  if (verfiedDelete.status === 'accepted') {
    await updateProductRatingService(verfiedDelete.productId)
  }

  return deletedReview
}

export const getReviewsByStatusService = async queryParams => {
  const validationResult = validateGetReviewsByStatus(queryParams)
  if (!validationResult.success) {
    throw new CustomError('Parámetros de consulta inválidos', 400)
  }

  const { status } = validationResult.data

  const reviews = await Review.find({
    status,
    fecha_baja: null,
  }).sort({ createdAt: -1 })

  if (!reviews || !Array.isArray(reviews)) {
    throw new CustomError(
      'Error al obtener las reseñas por estado de la base de datos',
      500
    )
  }

  return {
    reviews,
    total: reviews.length,
    status,
  }
}

export const getAllReviewsProductService = async productId => {
  if (!productId || typeof productId !== 'string') {
    throw new CustomError('ID de producto inválido', 400)
  }

  const reviews = await Review.find({ productId, fecha_baja: null })
  if (!reviews || !Array.isArray(reviews)) {
    throw new CustomError(
      'Error al obtener las reseñas del producto de la base de datos',
      500
    )
  }

  return reviews
}

// Moderación manual
export const moderateReviewByIdService = async (id, moderationData) => {
  const validationResult = validateModerateReview(moderationData)
  if (!validationResult.success) {
    throw new CustomError(
      'Datos de moderación inválidos, la decisión debe ser "Aprobada" o "Rechazada"',
      400
    )
  }

  const { decision, reason } = validationResult.data

  if (!id || typeof id !== 'string') {
    throw new CustomError('ID de reseña inválido', 400)
  }

  const mongoIdPattern = /^[0-9a-fA-F]{24}$/
  if (!mongoIdPattern.test(id)) {
    throw new CustomError('Formato de ID de reseña inválido', 400)
  }

  const review = await Review.findById(id)
  if (!review) {
    throw new CustomError('Reseña no encontrada', 404)
  }

  if (review.fecha_baja !== null) {
    throw new CustomError('Reseña no encontrada', 404)
  }

  if (review.status !== 'pending') {
    throw new CustomError(
      'Solo se pueden moderar reseñas en estado pendiente',
      400
    )
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

  if (!updated) {
    throw new CustomError(
      'Error al actualizar la reseña en la base de datos',
      500
    )
  }

  if (newStatus === 'moderated') {
    console.log(
      `⏳ Reseña ${updated._id} marcada como 'moderated' - esperando verificación de orden`
    )
  }

  return updated
}

// Moderación automática con Cron
export const moderateAllReviewsBatch = async () => {
  console.log('Iniciando moderación automática diaria')

  const reviewsToCheck = await Review.find({
    status: 'pending',
    fecha_baja: null,
  })

  if (!reviewsToCheck || !Array.isArray(reviewsToCheck)) {
    throw new CustomError(
      'Error al obtener las reseñas pendientes de la base de datos',
      500
    )
  }

  console.log(`Encontradas ${reviewsToCheck.length} reseñas para revisar`)

  let rejectedCount = 0
  let moderatedCount = 0

  for (const review of reviewsToCheck) {
    const moderationResult = moderateReviewContent(review.comment)

    if (!moderationResult) {
      throw new CustomError(
        'Error en el sistema de moderación de contenido',
        500
      )
    }

    const updatedReview = await Review.findByIdAndUpdate(
      review._id,
      {
        status: moderationResult.status,
        statusReason: moderationResult.statusReason,
      },
      { new: true }
    )

    if (!updatedReview) {
      throw new CustomError(
        `Error al actualizar la reseña ${review._id} en la base de datos`,
        500
      )
    }

    if (moderationResult.status === 'rejected') {
      rejectedCount++
      console.log(
        `❌ Review ${review._id} rechazada: ${moderationResult.statusReason}`
      )
    } else {
      moderatedCount++
      console.log(
        `✅ Review ${review._id} marcada como moderada - esperando verificación de orden`
      )
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
}
