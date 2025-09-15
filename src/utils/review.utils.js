export const moderateContent = text => {
  // Palabras prohibidas (en un entorno real, esta lista sería más extensa y estaría en una base de datos)
  const forbiddenWords = ['insulto', 'mala palabra', 'palabra ofensiva', 'spam']

  // Convertir a minúsculas para hacer la comparación insensible a mayúsculas/minúsculas
  const lowerText = text.toLowerCase()

  // Buscar palabras prohibidas
  const foundForbiddenWord = forbiddenWords.find(word =>
    lowerText.includes(word)
  )

  // Verificar enlaces (posible spam)
  const containsLinks = /(http|https):\/\/[^\s]+/.test(lowerText)

  if (foundForbiddenWord) {
    return {
      isApproved: false,
      isModerated: true,
      moderationReason: 'La reseña contiene lenguaje inapropiado',
    }
  }

  if (containsLinks) {
    return {
      isApproved: false,
      isModerated: true,
      moderationReason: 'La reseña contiene enlaces externos (posible spam)',
    }
  }

  return { isApproved: true, isModerated: false, moderationReason: null }
}

export const formatReview = review => {
  // Eliminar información sensible o innecesaria
  const { id, userId, productId, rating, comment, createdAt, updatedAt } =
    review
  return {
    id,
    userId,
    productId,
    rating,
    comment,
    createdAt,
    updatedAt,
  }
}

export const formatRating = rating => {
  return Math.round(rating * 10) / 10
}
