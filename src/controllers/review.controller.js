import {
  createReviewService,
  getReviewsService,
  getReviewByIdService,
  getReviewsByStatusService,
  moderateReviewByIdService,
  updateReviewService,
  deleteReviewByIdService,
  getAllReviewsProductService,
  getAverageRatingService,
} from '../services/review.service.js'
import {
  getProductRatingService,
  updateProductRatingService,
} from '../services/productRating.service.js'
import { dtoReview } from '../dtos/reviewDTO.js'
import { CustomError } from '../utils/customError.js'

export const createReview = async (req, res) => {
  try {
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

export const deletedReviewById = async (req, res) => {
  try {
    const { id } = req.params
    const deletedReview = await deleteReviewByIdService(id)

    res.status(200).json({
      status: 'success',
      message: 'Reseña eliminada exitosamente',
      data: dtoReview(deletedReview),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const getReviewsByStatus = async (req, res) => {
  try {
    const queryParams = { ...req.params, ...req.query }
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

export const getAllReviewsProduct = async (req, res) => {
  try {
    const { productId } = req.params
    const reviews = await getAllReviewsProductService(productId)

    res.status(200).json({
      status: 'success',
      message: `Reseñas del producto ${productId} obtenidas exitosamente`,
      data: reviews.map(review => dtoReview(review)),
      total: reviews.length,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params
    const reviews = await getAllReviewsProductService(productId)

    const averageRating = await getAverageRatingService(productId)

    res.status(200).json({
      status: 'success',
      message: `Reseñas del producto ${productId} obtenidas exitosamente`,
      data: reviews.map(review => dtoReview(review)),
      total: reviews.length,
      averageRating,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params
    const moderationData = req.body

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

export const getProductRating = async (req, res) => {
  try {
    const { productId } = req.params
    const ratingInfo = await getProductRatingService(productId)

    res.status(200).json({
      status: 'success',
      message: `Información de rating del producto ${productId} obtenida exitosamente`,
      data: ratingInfo,
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}

export const verifyReviewOrder = async (req, res) => {
  try {
    const { id } = req.params
    const authHeader = req.headers['authorization']

    const review = await getReviewByIdService(id)

    if (review.status !== 'moderated') {
      return res.status(400).json({
        status: 'error',
        message: 'Solo se pueden verificar reseñas en estado "moderated"',
      })
    }

    const { checkUserHasPurchasedProduct } = await import(
      '../services/orderVerification.service.js'
    )
    const hasPurchased = await checkUserHasPurchasedProduct(
      review.userId,
      review.productId,
      authHeader?.split(' ')[1]
    )

    if (hasPurchased) {
      review.status = 'accepted'
      review.statusReason = 'Compra verificada manualmente'
      await review.save()
      await updateProductRatingService(review.productId)
    } else {
      review.status = 'rejected'
      review.statusReason = 'Compra no verificada'
      await review.save()
    }

    res.status(200).json({
      status: 'success',
      message: `Reseña ${
        hasPurchased ? 'aceptada' : 'rechazada'
      } - verificación manual completada`,
      data: dtoReview(review),
    })
  } catch (error) {
    const status = error instanceof CustomError ? error.statusCode : 500
    return res.status(status).json({ error: error.message })
  }
}
