import axios from 'axios'
import { ORDERS_SERVICE_URL } from '../../config/dotenv.js'

export const checkUserHasPurchasedProduct = async (
  userId,
  productId,
  token
) => {
  try {
    console.log(
      `🔍 Verificando si usuario ${userId} compró producto ${productId}`
    )

    const response = await axios.get(
      `${ORDERS_SERVICE_URL}/orders/user/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      }
    )

    const orders = response.data

    if (!Array.isArray(orders)) {
      console.warn('⚠️ Respuesta de órdenes no es un array')
      return false
    }

    const hasPurchased = orders.some(order => {
      const validStatuses = ['validated', 'payment_defined', 'placed']
      const isValidOrder = validStatuses.includes(order.status)

      if (!isValidOrder) return false

      const hasProduct = order.articles?.some(
        article => article.articleId === productId
      )

      return hasProduct
    })

    console.log(
      `${hasPurchased ? '✅' : '❌'} Usuario ${
        hasPurchased ? 'SÍ' : 'NO'
      } compró el producto ${productId}`
    )

    return hasPurchased
  } catch (error) {
    console.error('❌ Error al verificar compra del producto:', error.message)

    if (error.code === 'ECONNREFUSED') {
      console.warn('⚠️ Servicio de órdenes no disponible, permitiendo reseña')
      return true
    }

    return false
  }
}
