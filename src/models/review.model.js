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

    status: {
      type: String,
      enum: ['pending', 'moderated', 'accepted', 'rejected'],
      default: 'pending',
    },

    statusReason: {
      type: String,
      default: null,
    },
    fecha_baja: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt
  }
)

// Validacion para evitar inyecciones
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

// Método estático para calcular la calificación promedio de un producto
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { productId, status: 'accepted', fecha_baja: null } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } },
  ])
  return result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0
}

const Review = mongoose.model('Review', reviewSchema)

export default Review
