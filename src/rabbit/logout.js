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
  console.log('RabbitMQ Consume logout: ' + rabbitMessage.message)
  invalidate(rabbitMessage.message) // eliminamos el token de la cache
}
