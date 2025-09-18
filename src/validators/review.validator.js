import { z } from 'zod'

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

export const updateReviewSchema = z
  .object({
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
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  })

export const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  productId: z.string().optional(),
  userId: z.string().optional(),
  sortBy: z.enum(['createdAt', 'rating']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const moderateReviewSchema = z.object({
  decision: z.enum(['Aprobada', 'Rechazada'], {
    errorMap: () => ({
      message: 'La decisión debe ser "Aprobada" o "Rechazada"',
    }),
  }),
  reason: z.string().min(3).max(200).optional(),
})

export const validateSchema = schema => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req.body)
      req.validatedData = data
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return res.status(400).json({
          status: 'error',
          message: 'Error de validación',
          errors: formattedErrors,
        })
      }
      next(error)
    }
  }
}

export const validateQuerySchema = schema => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req.query)
      req.validatedQuery = data
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        return res.status(400).json({
          status: 'error',
          message: 'Error de validación en parámetros de consulta',
          errors: formattedErrors,
        })
      }
      next(error)
    }
  }
}
