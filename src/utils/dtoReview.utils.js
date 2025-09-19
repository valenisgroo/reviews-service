export const dtoReview = review => {
  // Eliminar información sensible o innecesaria, pero incluir status
  const {
    id,
    userId,
    productId,
    rating,
    comment,
    status,
    createdAt,
    updatedAt,
  } = review
  return {
    id,
    userId,
    productId,
    rating,
    comment,
    status,
    createdAt,
    updatedAt,
  }
}
