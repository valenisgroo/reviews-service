import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { PORT } from './config/dotenv.js'
import { connectDB } from './config/bd.js'
import reviewRoutes from './src/routes/review.routes.js'
import { connectRabbitMQ } from './config/rabbit.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.use(reviewRoutes)

// Ruta raíz para verificar que el servicio está funcionando y mostrar documentación
app.get('/routes', (req, res) => {
  res.json({
    message: 'Microservicio de Reseñas API',
    endpoints: {
      createReview: {
        method: 'POST',
        url: '/create',
        description: 'Crear una nueva reseña',
        body: {
          userId: 'string (requerido)',
          productId: 'string (requerido)',
          rating: 'número entre 1-5 (requerido)',
          comment: 'string min:5, max:500 (requerido)',
        },
        response: {
          201: 'Reseña creada exitosamente',
          400: 'Datos inválidos o el usuario ya ha dejado una reseña para este producto',
          500: 'Error interno del servidor',
        },
      },
      getReviews: {
        method: 'GET',
        url: '/reviews',
        description: 'Obtener todas las reseñas con filtrado opcional',
        queryParams: {
          page: 'número (opcional, default: 1)',
          limit: 'número (opcional, default: 10)',
          productId: 'string (opcional, filtrar por producto)',
          userId: 'string (opcional, filtrar por usuario)',
          sortBy: 'string (opcional, default: createdAt)',
          order: 'string (opcional, asc o desc, default: desc)',
        },
        response: {
          200: 'Lista de reseñas con metadatos de paginación',
          500: 'Error interno del servidor',
        },
      },
      getReviewById: {
        method: 'GET',
        url: '/reviews/:id',
        description: 'Obtener una reseña específica por su ID',
        response: {
          200: 'Reseña encontrada',
          404: 'Reseña no encontrada',
          400: 'ID de reseña inválido',
          500: 'Error interno del servidor',
        },
      },
    },
  })
})

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
})

connectDB()
connectRabbitMQ()
