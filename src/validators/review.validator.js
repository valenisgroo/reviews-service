import { z } from 'zod'

// Esquema de validación para crear una reseña
export const createReviewSchema = z.object({
  userId: z.string().min(1, 'El ID de usuario es requerido'),
  productId: z.string().min(1, 'El ID del producto es requerido'),
  rating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),
  comment: z
    .string()
    .min(5, 'El comentario debe tener al menos 5 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres'),
})

// Esquema de validación para actualizar una reseña
export const updateReviewSchema = z.object({
  rating: z
    .number()
    .int('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),
  comment: z
    .string()
    .min(5, 'El comentario debe tener al menos 5 caracteres')
    .max(500, 'El comentario no puede exceder los 500 caracteres')
    .optional(),
})

// Middleware para validar esquemas
// export const validateSchema = schema => {
//   return (req, res, next) => {
//     try {
//       const data = schema.parse(req.body)
//       req.validatedData = data
//       next()
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         const formattedErrors = error.errors.map(err => ({
//           path: err.path.join('.'),
//           message: err.message,
//         }))
//         return res.status(400).json({
//           status: 'error',
//           message: 'Error de validación',
//           errors: formattedErrors,
//         })
//       }
//       next(error)
//     }
//   }
// }
