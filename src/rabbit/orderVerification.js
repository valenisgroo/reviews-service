import { RabbitDirectConsumer } from './directConsumer.js'
import Review from '../models/review.model.js'
import { updateProductRatingService } from '../services/productRating.service.js'

export function init() {
  const directConsumer = new RabbitDirectConsumer('place_order', 'place_order')
  directConsumer.addProcessor('default', processOrderPlaced)
  directConsumer.init()
}

async function processOrderPlaced(rabbitMessage) {
  console.log(
    '📦 RabbitMQ - Orden creada recibida:',
    JSON.stringify(rabbitMessage, null, 2)
  )

  // El mensaje puede venir anidado en 'message' o directamente
  const orderData = rabbitMessage.message || rabbitMessage

  // Extraer datos con diferentes posibles nombres de campos
  const orderId = orderData.orderId || orderData.order_id || orderData.id
  const userId = orderData.userId || orderData.user_id
  const articles = orderData.articles || []

  if (!userId || !articles || articles.length === 0) {
    console.error('Datos incompletos en el mensaje de orden')
    console.error(`UserId: ${userId}, Articles: ${articles.length}`)
    return
  }

  try {
    // Extraer IDs de productos (puede ser 'id', 'articleId', o 'article_id')
    const productIds = articles
      .map(article => article.articleId || article.article_id || article.id)
      .filter(id => id)

    if (productIds.length === 0) {
      console.error('No se pudieron extraer IDs de productos de los artículos')
      return
    }

    const pendingReviews = await Review.find({
      userId: userId,
      productId: { $in: productIds },
      status: 'moderated',
      fecha_baja: null,
    })

    for (const review of pendingReviews) {
      const wasOrdered = productIds.includes(review.productId)

      if (wasOrdered) {
        review.status = 'accepted'
        review.statusReason = `Reseña aprobada debido a producto verificado`
        await review.save()

        await updateProductRatingService(review.productId)

        console.log(
          `Reseña ${review._id} aceptada debido a producto ${review.productId} verificado.`
        )
      }
    }
  } catch (error) {
    console.error('Error al procesar orden para verificación:', error)
  }
}
