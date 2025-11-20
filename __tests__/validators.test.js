import {
  validateCreateReview,
  validateUpdateReview,
  validateModerateReview,
} from '../src/validators/review.validator.js'

describe('Review Validators', () => {
  describe('validateCreateReview', () => {
    test('debe validar review válida', () => {
      const validReview = {
        userId: 'user123',
        productId: 'prod456',
        rating: 5,
        comment: 'Excelente producto',
      }

      const result = validateCreateReview(validReview)
      expect(result.success).toBe(true)
    })

    test('debe rechazar rating fuera de rango', () => {
      const invalidReview = {
        userId: 'user123',
        productId: 'prod456',
        rating: 6,
        comment: 'Comentario válido',
      }

      const result = validateCreateReview(invalidReview)
      expect(result.success).toBe(false)
    })

    test('debe rechazar comentario muy corto', () => {
      const invalidReview = {
        userId: 'user123',
        productId: 'prod456',
        rating: 5,
        comment: 'Mal',
      }

      const result = validateCreateReview(invalidReview)
      expect(result.success).toBe(false)
    })
  })

  describe('validateUpdateReview', () => {
    test('debe permitir actualizar solo rating', () => {
      const update = { rating: 4 }
      const result = validateUpdateReview(update)
      expect(result.success).toBe(true)
    })

    test('debe permitir actualizar solo comment', () => {
      const update = { comment: 'Actualizado correctamente' }
      const result = validateUpdateReview(update)
      expect(result.success).toBe(true)
    })
  })

  describe('validateModerateReview', () => {
    test('debe aceptar decisión Aprobada', () => {
      const moderation = {
        decision: 'Aprobada',
        reason: 'Cumple con las políticas',
      }

      const result = validateModerateReview(moderation)
      expect(result.success).toBe(true)
    })

    test('debe aceptar decisión Rechazada', () => {
      const moderation = {
        decision: 'Rechazada',
        reason: 'Contenido inapropiado',
      }

      const result = validateModerateReview(moderation)
      expect(result.success).toBe(true)
    })

    test('debe rechazar decisión inválida', () => {
      const moderation = {
        decision: 'Pendiente',
      }

      const result = validateModerateReview(moderation)
      expect(result.success).toBe(false)
    })
  })
})
