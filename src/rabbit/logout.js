import { RabbitFanoutConsumer } from './fanoutConsumer.js'
import { invalidate } from '../middlewares/auth.middleware.js'

// Inicializamos consumidor de logout
export function init() {
  const fanout = new RabbitFanoutConsumer('auth')
  fanout.addProcessor('logout', processLogout)
  fanout.init()
}

// Procesador de logout
function processLogout(rabbitMessage) {
  console.log(
    '1) RabbitMQ mensaje recibido de auth:',
    JSON.stringify(rabbitMessage, null, 2)
  )

  // El auth envía "Bearer token", necesitamos extraer solo el token
  let tokenToInvalidate = rabbitMessage.message
  if (tokenToInvalidate && tokenToInvalidate.includes(' ')) {
    tokenToInvalidate = tokenToInvalidate.split(' ')[1] // Mismo método que auth middleware
  }

  console.log('2) Token a invalidar:', tokenToInvalidate)
  invalidate(tokenToInvalidate) // eliminamos el token de la cache
  console.log('3) Token invalidado exitosamente')
}
