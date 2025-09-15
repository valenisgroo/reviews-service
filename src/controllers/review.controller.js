import reviewService from '../services/review.service.js'

export const createReview = async (req, res) => {
  try {
    const reviewData = req.body

    const newReview = await reviewService.createNewReview(reviewData)
    res.status(201).json(formatReview(newReview))
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al crear la reseña' })
  }
}

export const getReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviews()
    res.json({ reviews })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener las reseñas' })
  }
}

export const getReviewById = async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id)
    res.json({ review })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener la reseña' })
  }
}
