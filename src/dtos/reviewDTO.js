export const dtoReview = review => {
  const { id, userId, productId, rating, comment, status, fecha_baja } = review
  return {
    id,
    userId,
    productId,
    rating,
    comment,
    status,
    fecha_baja,
  }
}
