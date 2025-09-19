import { z } from 'zod'

const createReviewSchema = z.object({
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

const updateReviewSchema = z
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

const moderateReviewSchema = z.object({
  decision: z.enum(['Aprobada', 'Rechazada'], {
    errorMap: () => ({
      message: 'La decisión debe ser "Aprobada" o "Rechazada"',
    }),
  }),
  reason: z.string().min(3).max(200).optional(),
})

const getReviewsByStatusSchema = z.object({
  status: z.enum(['pending', 'moderated', 'accepted', 'rejected'], {
    errorMap: () => ({
      message: 'El estado debe ser: pending, moderated, accepted o rejected',
    }),
  }),
})

export function validateCreateReview(object) {
  return createReviewSchema.safeParse(object)
}

export function validateUpdateReview(object) {
  return updateReviewSchema.safeParse(object)
}

export function validateModerateReview(object) {
  return moderateReviewSchema.safeParse(object)
}

export function validateGetReviewsByStatus(object) {
  return getReviewsByStatusSchema.safeParse(object)
}
