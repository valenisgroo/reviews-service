import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { PORT } from './config/dotenv.js'
import { connectDB } from './config/bd.js'
import reviewRoutes from './src/routes/review.routes.js'

const app = express()

app.use(cors())

// Middleware para parsear JSON
app.use(express.json())

// Rutas
app.use(reviewRoutes)

// Ruta raíz para verificar que el servicio está funcionando
app.get('/', (req, res) => {
  res.json({
    message: 'Microservicio de Reseñas API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      createReview: 'POST /api/reviews',
      getProductReviews: 'GET /api/reviews/product/:productId',
      getUserReviews: 'GET /api/reviews/user/:userId',
      getProductRating: 'GET /api/reviews/product/:productId/rating',
      updateReview: 'PUT /api/reviews/:reviewId',
      deleteReview: 'DELETE /api/reviews/:reviewId',
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
