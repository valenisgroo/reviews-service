import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    isApproved: {
      type: Boolean,
      default: true, // Por defecto, las reseñas se aprueban automáticamente
    },
    isModerated: {
      type: Boolean,
      default: false, // Indica si la reseña ha sido moderada
    },
    moderationReason: {
      type: String,
      default: null, // Razón de moderación si fue rechazada
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
  }
)

// Índice compuesto para impedir que un usuario deje múltiples reseñas para el mismo producto
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Método estático para calcular la calificación promedio de un producto
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { productId, isApproved: true } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } },
  ])
  return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0
}

const Review = mongoose.model('Review', reviewSchema)

export default Review
