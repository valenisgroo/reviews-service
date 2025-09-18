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
    // Estado centralizado: controla el flujo de la reseña
    status: {
      type: String,
      enum: [
        'pending', // Recién creada, esperando moderación
        'moderated', // Fue moderada (por cron o manual) y está pendiente de verificación de orden
        'accepted', // Aceptada tras verificación de orden (reseña válida)
        'rejected', // Rechazada por moderación o por no encontrarse la orden
      ],
      default: 'pending',
    },
    // Motivo asociado al estado (p. ej. palabra prohibida, orden no encontrada, motivo manual)
    statusReason: {
      type: String,
      default: null,
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
    { $match: { productId, status: 'accepted' } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } },
  ])
  return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0
}

const Review = mongoose.model('Review', reviewSchema)

export default Review
