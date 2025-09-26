export const dtoReview = review => {
  const { id, userId, productId, rating, comment, status } = review
  return {
    id,
    userId,
    productId,
    rating,
    comment,
    status,
  }
}
