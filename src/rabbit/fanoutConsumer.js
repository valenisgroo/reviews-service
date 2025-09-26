import amqp from 'amqplib'

export class RabbitFanoutConsumer {
  constructor(exchange) {
    this.exchange = exchange
    this.rabbitUrl = process.env.RABBIT_URL || 'amqp://localhost'
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

      await channel.assertExchange(this.exchange, 'fanout', { durable: false })
      const queue = await channel.assertQueue('', { exclusive: true })
      await channel.bindQueue(queue.queue, this.exchange, '')

      channel.consume(
        queue.queue,
        message => {
          if (!message) return
          const rabbitMessage = JSON.parse(message.content.toString())

          // Si no hay tipo específico, asumir que todos los mensajes del exchange "auth" son logout
          const messageType =
            rabbitMessage.type || (this.exchange === 'auth' ? 'logout' : null)

          if (messageType && this.processors.has(messageType)) {
            this.processors.get(messageType)(rabbitMessage)
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
