import amqp from 'amqplib'
import { RABBIT_URL } from './dotenv.js'
import { init as initLogout } from '../src/rabbit/logout.js'

export const connectRabbitMQ = async () => {
  try {
    const rabbitUrl = RABBIT_URL || 'amqp://localhost:5672'
    const connection = await amqp.connect(rabbitUrl)
    console.log(`Conectado a RabbitMQ en ${rabbitUrl}`)

    const channel = await connection.createChannel()
    console.log('Canal creado')

    await channel.close()
    await connection.close()
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error)
    setTimeout(connectRabbitMQ, 5000)
  }
}

export const initRabbitMQConsumers = () => {
  // Inicializa consumidores, incluyendo logout
  initLogout()
}
