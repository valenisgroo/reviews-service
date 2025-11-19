import amqp from 'amqplib'
import { RABBIT_URL } from '../../config/dotenv.js'

export class RabbitDirectConsumer {
  constructor(exchange, routingKey) {
    this.exchange = exchange
    this.routingKey = routingKey
    this.rabbitUrl = RABBIT_URL
    this.processors = new Map()
    console.log(`RabbitMQ ${this.exchange}: usando URL ${this.rabbitUrl}`)
  }

  addProcessor(type, processor) {
    this.processors.set(type, processor)
  }

  async init() {
    try {
      const conn = await amqp.connect(this.rabbitUrl)
      const channel = await conn.createChannel()

      channel.on('close', () => {
        console.error(
          'RabbitMQ ' +
            this.exchange +
            ' conexión cerrada, intentando reconectar en 10s'
        )
        setTimeout(() => this.init(), 10000)
      })

      console.log('RabbitMQ ' + this.exchange + ' conectado')

      await channel.assertExchange(this.exchange, 'direct', { durable: false })
      const queue = await channel.assertQueue('', { exclusive: true })
      await channel.bindQueue(queue.queue, this.exchange, this.routingKey)

      channel.consume(
        queue.queue,
        message => {
          if (!message) return
          const rabbitMessage = JSON.parse(message.content.toString())

          const messageType = rabbitMessage.type || 'default'

          if (this.processors.has(messageType)) {
            this.processors.get(messageType)(rabbitMessage)
          } else if (this.processors.has('default')) {
            this.processors.get('default')(rabbitMessage)
          } else {
            console.log(`❌ No hay procesador para tipo: ${messageType}`)
            console.log(
              'Procesadores disponibles:',
              Array.from(this.processors.keys())
            )
          }
        },
        { noAck: true }
      )
    } catch (error) {
      console.error(`RabbitMQ ${this.exchange}: Error - ${error.message}`)
      if (error.code === 'ECONNREFUSED') {
        console.error(
          `RabbitMQ ${this.exchange}: No se pudo conectar a ${this.rabbitUrl}`
        )
      }
      setTimeout(() => this.init(), 10000)
    }
  }
}
