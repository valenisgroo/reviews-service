import { RabbitFanoutConsumer } from './fanoutConsumer.js'
import { invalidate } from '../middlewares/auth.middleware.js'

// Inicializamos consumidor de logout
export function init() {
  const fanout = new RabbitFanoutConsumer('auth')
  fanout.addProcessor('logout', processLogout)
  fanout.init()
}

function processLogout(rabbitMessage) {
  // El auth envía "Bearer token", necesitamos extraer solo el token
  let tokenToInvalidate = rabbitMessage.message
  if (tokenToInvalidate && tokenToInvalidate.includes(' ')) {
    tokenToInvalidate = tokenToInvalidate.split(' ')[1] // extraer token
  }

  invalidate(tokenToInvalidate) // eliminamos el token de la cache
  console.log('Token invalidado exitosamente')
}
