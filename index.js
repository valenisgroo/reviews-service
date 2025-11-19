import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { PORT } from './config/dotenv.js'
import { connectDB } from './config/bd.js'
import reviewRoutes from './src/routes/review.routes.js'
import { init as initLogout } from './src/rabbit/logout.js'
import setupModerationCron from './src/jobs/moderationCron.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './src/config/swagger.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(reviewRoutes)

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  })
})

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
  console.log(
    `Documentación API disponible en http://localhost:${PORT}/api-docs`
  )
})

connectDB()

// Inicializar consumidores de RabbitMQ (incluyendo logout)
initLogout()

// Iniciar cron job de moderación
setupModerationCron()
