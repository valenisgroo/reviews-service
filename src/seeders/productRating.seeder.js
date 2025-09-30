import { updateProductRatingService } from '../src/services/productRating.service.js'
import Review from '../src/models/review.model.js'

async function initializeProductRatings() {
  const productIds = await Review.distinct('productId', {
    status: 'accepted',
    fecha_baja: null,
  })

  console.log(`Inicializando ratings para ${productIds.length} productos...`)

  for (const productId of productIds) {
    await updateProductRatingService(productId)
    console.log(`Rating calculado para producto: ${productId}`)
  }

  console.log('Inicialización completada!')
}

initializeProductRatings()
